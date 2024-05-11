from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import Database   
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse


app = FastAPI()
db = Database('sqlite:///database.db')
app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"], #TODO write necessary ones
    allow_headers=["*"],
)

# Pydantic models
# class Stats(BaseModel):
#     rows: int
#     balls: int
#     speed: int
#     probabilityLeft: int
#     probabilityRight: int
#     statsWatcher: str

@app.get("/")
def read_root():
    return FileResponse('frontend/index.html')


@app.post("/")
async def submit_data(data: dict):
    db.saveData(
    data.get("rows"), 
    data.get("balls"), 
    data.get("probabilityLeft"), 
    data.get("probabilityRight"), 
    data.get("statswatcher")
    )  
    return {"message": "Stats submitted successfully"}
 