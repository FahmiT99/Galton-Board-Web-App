from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware 
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import os, plot, crud, models, schemas
from database import SessionLocal, engine
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler


models.Base.metadata.create_all(bind=engine)


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

    

@asynccontextmanager
async def lifespan(app:FastAPI):
    scheduler = BackgroundScheduler()
    scheduler.add_job(crud.reset_data, "interval", minutes=1, args=(SessionLocal(),))
    scheduler.start()
    yield



app = FastAPI(lifespan=lifespan)

app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"], #TODO write necessary ones
    allow_headers=["*"],
)



@app.get("/")
def read_root():
    return FileResponse('frontend/homepage.html')



@app.get("/main")
def load_main():
    return FileResponse('frontend/main.html')



@app.get("/test")
def load_test():
    return FileResponse('frontend/test.html')



@app.get("/check_groupID/")
def check_groupID(group_id: str, db: Session = Depends(get_db)):

    try:
        if not crud.check_group_id_exists(db, group_id): 
            return JSONResponse(status_code=404, content={"detail":"Gruppe exisitiert nicht"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))    



@app.get("/plot/")
def get_plot(group_id: str, db: Session = Depends(get_db)):

    try:
        plot_paths = plot.generate_plots(group_id, crud.get_group_data(db, group_id))

        if plot_paths:
            return JSONResponse(content={"plot_paths": f"/frontend/plots/{plot_paths}"}) #???
        else:
            return JSONResponse(status_code=404, content={"detail":"Keine plots wurden generiert."})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/list-plots/")
def list_plots(group_id: str):

    try:
        plot_dir = "frontend/plots"

        plot_files = [f"/frontend/plots/{file}" for file in os.listdir(plot_dir) if file.startswith(f"{group_id}_")]

        if plot_files:
            return JSONResponse(content={"plot_paths": plot_files})
        else:
            return JSONResponse(status_code=404, content={"detail":"keine plots wurden für diese Gruppe gefunden."})    
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Plot Verzeichnis nicht gefunden.")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/", status_code=201)
def submit_data(data_create: schemas.DataCreate, db: Session = Depends(get_db)):

    try:
        if not crud.save_data(db, data_create):
            return JSONResponse(status_code=404, content={"detail":"Gruppe nicht gefunden. Bitte zur Startseite kehren"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


@app.post("/create_groupID/", status_code=201)
def create_group_id(group_create: schemas.GroupCreate, db: Session = Depends(get_db)):

    try:
        group_created = crud.create_group(db, group_create)
        if group_created:
            return {"detail": "Gruppe wurde erstellt!"}
        else:
             return JSONResponse(status_code=400, content={"detail": "Gruppe existiert bereits. Bitte einen anderen Namen eingeben"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))    




if __name__ == "__main__":
    os.system("uvicorn main:app --reload")


 