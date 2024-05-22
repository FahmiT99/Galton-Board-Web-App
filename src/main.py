from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from database import Database   
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import asyncio, os, plot, uvicorn
from pydantic import BaseModel
from starlette.requests import Request
from typing import Optional

app = FastAPI()
db = Database('sqlite:///database.db')
app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")

 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"], #TODO write necessary ones
    allow_headers=["*"],
)
# class GroupID(BaseModel):
#     group_id: str


async def reset_db(delay):
    while True:
        await asyncio.sleep(delay)
        db.reset_data()

# @app.on_event("startup")
# async def startup_event():
#     # Schedule the reset_id function to run in 24 hours
#     asyncio.create_task(reset_db(24 * 60 * 60))

@app.get("/")
def read_root():
    return FileResponse('frontend/homepage.html')

@app.get("/main")
def load_main():
    return FileResponse('frontend/main.html')

@app.get("/check_groupID")
def check_groupID(group_id: str):
    if db.check_group_id_exists(group_id): 
        ok = True
        return {"ok": ok}
    else:
        #raise HTTPException(status_code=404, detail="Gruppe exisitiert nicht")
        return {"message": "Gruppe exisitiert nicht"}



@app.post("/create_groupID")
async def create_groupID(data: dict): 
    if db.create_group(data.get("group_id")): 
        return{"message" : "Gruppe wurde erstellt!"}
    else:
        return{"message": "Gruppe existiert bereits. Bitte einen anderen Namen eingeben"}
    

 

@app.post("/")
async def submit_data(data: dict):
    db.saveData(
    data.get("group_id"),
    data.get("rows"), 
    data.get("balls"), 
    data.get("probabilityLeft"), 
    data.get("probabilityRight"), 
    data.get("statswatcher")
    )  
    return {"message": "Stats submitted successfully"}

#Testing plot Generation

@app.get("/test")
def load_test():
    return FileResponse('frontend/test.html')
 

@app.get("/plot")
async def get_plot():
    plot_path = plot.generate_plot()
    return JSONResponse(content={"plot_path": f"/frontend/plots/{plot_path}"})

if __name__ == "__main__":
    os.system("uvicorn main:app --reload")