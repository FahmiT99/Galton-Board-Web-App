from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from database import Database   
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import asyncio, os, plot ,uvicorn
from pydantic import BaseModel
from starlette.requests import Request
from typing import Optional
import plot, time




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

    # Cleanup plots if necessary
    cleanup_plots_and_db()

    return {"message": "Stats submitted successfully"}

#Testing plot Generation

@app.get("/test")
def load_test():
    return FileResponse('frontend/test.html')
 

@app.get("/plot")
async def get_plot(group_id: str):
    #print(db.get_group_data(group_id))
    plot_paths = plot.generate_plots(group_id, db.get_group_data(group_id))
    #return JSONResponse(content={"plot_path": f"/frontend/plots/{plot_path}"})
    return JSONResponse(content={"plot_paths": f"/frontend/plots/{plot_paths}"})


@app.get("/list-plots")
async def list_plots(group_id: str):
    plot_dir = "frontend/plots"
    plot_files = [f"/frontend/plots/{file}" for file in os.listdir(plot_dir) if file.startswith(f"{group_id}_")]
    return JSONResponse(content={"plot_paths": plot_files})


def cleanup_plots_and_db():
    plot_dir = "frontend/plots"
    plot_files = [file for file in os.listdir(plot_dir) if os.path.isfile(os.path.join(plot_dir, file))]

    if len(plot_files) > 100:
        # Sort files by modification time (oldest first)
        plot_files.sort(key=lambda x: os.path.getmtime(os.path.join(plot_dir, x)))

        # Identify the oldest group_id and remove corresponding files and database rows
        oldest_file = plot_files[0]
        oldest_group_id = oldest_file.split('_')[0]

        # Remove all files with the oldest group_id
        for file in plot_files:
            if file.startswith(f"{oldest_group_id}_"):
                os.remove(os.path.join(plot_dir, file))

        # Remove corresponding rows from the database
        db.delete_group_data(oldest_group_id)




if __name__ == "__main__":
    os.system("uvicorn main:app --reload")


# for x in db.get_group_data("g"):
#     print(x.id)