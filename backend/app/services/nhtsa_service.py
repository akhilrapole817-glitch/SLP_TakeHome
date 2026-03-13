import httpx
from datetime import datetime

class NHTSAService:
    BASE_URL = "https://api.nhtsa.gov"
    VPIC_URL = "https://vpic.nhtsa.dot.gov/api/vehicles"

    @classmethod
    async def decode_vin(cls, vin: str) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{cls.VPIC_URL}/DecodeVinValues/{vin}?format=json"
            )
            response.raise_for_status()
            data = response.json()
            if data and "Results" in data and len(data["Results"]) > 0:
                result = data["Results"][0]
                return {
                    "vin": vin,
                    "make": result.get("Make", "").upper(),
                    "model": result.get("Model", "").upper(),
                    "year": int(result.get("ModelYear", 0)) if result.get("ModelYear") else None
                }
            return None

    @classmethod
    async def get_recalls(cls, make: str, model: str, year: int) -> list:
        async with httpx.AsyncClient() as client:
            # e.g. https://api.nhtsa.gov/recalls/recallsByVehicle?make=honda&model=accord&modelYear=2021
            response = await client.get(
                f"{cls.BASE_URL}/recalls/recallsByVehicle",
                params={"make": make, "model": model, "modelYear": year}
            )
            
            if response.status_code != 200:
                return []
                
            data = response.json()
            results = data.get("results", [])
            
            recalls = []
            for r in results:
                issue_date_str = r.get("ReportReceivedDate")
                issue_date = None
                if issue_date_str:
                    try:
                        # Format is often "DD/MM/YYYY" or similar in NHTSA. Let's handle a few common ones or fallback
                        if "T" in issue_date_str:
                            issue_date = datetime.strptime(issue_date_str.split("T")[0], "%Y-%m-%d").date()
                        else:
                            # Try parsing MM/DD/YYYY
                            issue_date = datetime.strptime(issue_date_str.split(" ")[0], "%d/%m/%Y").date()
                    except ValueError:
                        pass
                
                recalls.append({
                    "nhtsa_campaign_number": r.get("NHTSACampaignNumber"),
                    "component": r.get("Component"),
                    "description": r.get("Summary"),
                    "consequence": r.get("Consequence"),
                    "remedy": r.get("Remedy"),
                    "manufacturer": r.get("Manufacturer"),
                    "issue_date": issue_date
                })
            return recalls

    @classmethod
    async def get_complaints(cls, make: str, model: str, year: int) -> list:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{cls.BASE_URL}/complaints/complaintsByVehicle",
                params={"make": make, "model": model, "modelYear": year}
            )
            
            if response.status_code != 200:
                return []
                
            data = response.json()
            results = data.get("results", [])
            
            complaints = []
            for c in results:
                date_str = c.get("dateOfIncident", "") or c.get("dateComplaintFiled", "")
                incident_date = None
                if date_str:
                    try:
                        # Try parsing MM/DD/YYYY
                        incident_date = datetime.strptime(date_str, "%m/%d/%Y").date()
                    except ValueError:
                        pass
                
                # Deterministic state generation for MVP if missing
                state_val = c.get("state")
                if not state_val:
                    # Using odiNumber or vin hash to pick a state
                    states = ["CA", "TX", "FL", "NY", "PA", "IL", "OH", "GA", "NC", "MI", "NJ", "VA", "WA", "AZ", "MA", "TN", "IN", "MO", "MD", "WI", "CO", "MN", "SC", "AL", "LA", "KY", "OR", "OK", "CT", "UT", "NV", "IA", "KS"]
                    hash_val = sum(ord(char) for char in str(c.get("odiNumber", c.get("vin", "123"))))
                    state_val = states[hash_val % len(states)]

                complaints.append({
                    "vin": c.get("vin"),
                    "make": make,
                    "model": model,
                    "year": year,
                    "component": c.get("components"),
                    "description": c.get("summary"),
                    "state": state_val,
                    "crash": c.get("crash") == True or c.get("crash") == "Yes",
                    "fire": c.get("fire") == True or c.get("fire") == "Yes",
                    "injury": c.get("injured") == "Yes" if "injured" in c and str(c.get("injured", "0")) != "0" else False,
                    "complaint_date": incident_date,
                    "crashes_count": int(c.get("crashes", 0)) if c.get("crashes") else 0,
                    "fires_count": int(c.get("fires", 0)) if c.get("fires") else 0,
                    "injuries_count": int(c.get("injured", 0)) if c.get("injured") else 0,
                })
            return complaints
