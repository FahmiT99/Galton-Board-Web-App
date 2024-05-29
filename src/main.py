from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware 
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import asyncio, os, plot, crud, models, schemas
from database import SessionLocal, engine


models.Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


app = FastAPI()

app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"], #TODO write necessary ones
    allow_headers=["*"],
)

# async def reset_db(delay):
#     while True:
#         await asyncio.sleep(delay)
#         db.reset_data()




@app.get("/")
def read_root():
    return FileResponse('frontend/homepage.html')

@app.get("/main")
def load_main():
    return FileResponse('frontend/main.html')


@app.get("/check_groupID/")
def check_groupID(group_id: str, db: Session = Depends(get_db)):
    if crud.check_group_id_exists(db, group_id): 
        ok = True
        return {"ok": ok}
    else:
        #raise HTTPException(status_code=404, detail="Gruppe exisitiert nicht")
        return {"message": "Gruppe exisitiert nicht"}



@app.post("/create_groupID/")
async def create_group_id(group_create: schemas.GroupCreate, db: Session = Depends(get_db)):
    if crud.create_group(db, group_create):
        return {"message": "Gruppe wurde erstellt!"}
    else:
        return {"message": "Gruppe existiert bereits. Bitte einen anderen Namen eingeben"}

 

@app.post("/")
async def submit_data(data_create: schemas.DataCreate, db: Session = Depends(get_db)):

    crud.save_data(db, data_create)
    
    # Cleanup plots if necessary
    #cleanup_plots_and_db()

    return {"message": "Stats submitted successfully"}




#Testing plot Generation

@app.get("/test")
def load_test():
    return FileResponse('frontend/test.html')
 



@app.get("/plot/")
async def get_plot(group_id: str, db: Session = Depends(get_db)):

    plot_paths = plot.generate_plots(group_id, crud.get_group_data(db, group_id))

    return JSONResponse(content={"plot_paths": f"/frontend/plots/{plot_paths}"})





@app.get("/list-plots/")
async def list_plots(group_id: str):

    plot_dir = "frontend/plots"
    plot_files = [f"/frontend/plots/{file}" for file in os.listdir(plot_dir) if file.startswith(f"{group_id}_")]

    return JSONResponse(content={"plot_paths": plot_files})





def cleanup_plots_and_db(db: Session = Depends(get_db)):

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
        crud.delete_group_data(db, oldest_group_id)




if __name__ == "__main__":
    os.system("uvicorn main:app --reload")


 