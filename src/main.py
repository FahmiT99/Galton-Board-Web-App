from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from database import Database   
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import asyncio
import os
import plot

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

# Initialize a variable to keep track of the last groupID
last_id = 0
lock = asyncio.Lock()

#reset database here ?
async def reset_id(delay):
    while True:
        await asyncio.sleep(delay)
        global last_id
        last_id = 0
        db.reset_data()


@app.on_event("startup")
async def startup_event():
    # Schedule the reset_id function to run in 24 hours
    asyncio.create_task(reset_id(24 * 60 * 60))

@app.get("/")
def read_root():
    return FileResponse('frontend/homepage.html')

@app.get("/loadMain")
def load_main():
    return FileResponse('frontend/main.html')

@app.get("/generate-groupID")
async def generate_id():
    global last_id
    async with lock:
        last_id += 1
        new_id = f"G{last_id}"
    return {"id": new_id}


@app.get("/export")
def export_data():
    return  db.get_table()

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





#Testing plot Generation

@app.get("/test")
def load_main():
    return FileResponse('frontend/test.html')
 

@app.get("/plot")
async def get_plot():
    plot_path = plot.generate_plot()
    return JSONResponse(content={"plot_path": f"/frontend/plots/{plot_path}"})

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)