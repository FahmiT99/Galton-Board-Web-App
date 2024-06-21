from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware 
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import os, plot, crud, models, schemas, uvicorn
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
      # Create an initial group for users without one
    try:
        # Check if the group already exists to avoid duplication
        group_create = schemas.GroupCreate(group_id=".")
        group_created = crud.create_group(SessionLocal(), group_create)
        if group_created:
            print(f"Initial group '{group_create.group_id}' created.")
        else:
            print(f"Group '{group_create.group_id}' already exists.")
    except Exception as e:
        print(f"Failed to create initial group: {e}")

    #reset db and plots each 24 hours after startup
    scheduler = BackgroundScheduler()
    scheduler.add_job(crud.reset_data, "interval", minutes=24*60 , args=(SessionLocal(),))
    scheduler.start()
    yield
    scheduler.shutdown()
    
   

    


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



@app.get("/results")
def load_test():
    return FileResponse('frontend/test.html')



@app.get("/check_userID/")
def check_groupID(user_id: str, db: Session = Depends(get_db)):

    try:
        if not crud.user_id_exists(db, user_id): 
            return JSONResponse(status_code=404, content={"detail":"User exisitiert nicht"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 




@app.get("/check_groupID/")
def check_groupID(group_id: str, db: Session = Depends(get_db)):

    try:
        if not crud.group_id_exists(db, group_id): 
            return JSONResponse(status_code=404, content={"detail":"Gruppe exisitiert nicht"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 



@app.get("/list-user-plots/")
def list_plots(user_id: str, db: Session = Depends(get_db)):

    try:
        plot_paths = crud.get_user_plots(db, user_id)
        print(plot_paths)
        print(type(plot_paths))
        if plot_paths:
            return JSONResponse(content={"plot_paths": plot_paths})
        else:
            return JSONResponse(status_code=404, content={"detail":"keine plots wurden gefunden."})    
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Plot Verzeichnis nicht gefunden.")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


@app.get("/list-group-plots/")
def list_plots(group_id: str, db: Session = Depends(get_db)):

    try:
        plot_paths = crud.get_group_plots(db, group_id)

        if plot_paths:
            return JSONResponse(content={"plot_paths": plot_paths})
        else:
            return JSONResponse(status_code=404, content={"detail":"keine plots wurden gefunden."})    
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Plot Verzeichnis nicht gefunden.")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/", status_code=201)
def submit_data(data_create: schemas.DataCreate, db: Session = Depends(get_db)):

    try:
        if not crud.save_data(db, data_create):
            return JSONResponse(status_code=404, content={"detail":"Gruppe oder Benutzer nicht gefunden. Bitte zur Startseite kehren!"})
        
        plot_path = plot.generate_plots(data_create, crud.get_user_data_counter(db, data_create.user_id))
        crud.add_plot_path(db, data_create, plot_path)
 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


@app.post("/create_userID/", status_code=201)
def create_user_id(user_create: schemas.UserCreate, db: Session = Depends(get_db)):
    
    try:
        user_created = crud.create_user(db, user_create)
        if not user_created:
            return JSONResponse(status_code=400, content={"detail": "User existiert bereits"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 



@app.post("/create_groupID/", status_code=201)
def create_group_id(group_create: schemas.GroupCreate, db: Session = Depends(get_db)):

    try:
        if (group_create.group_id == "."):
            return JSONResponse(status_code=400, content={"detail": "Bitte einen anderen Namen eingeben"})
        group_created = crud.create_group(db, group_create)
        if group_created:
            return {"detail": "Gruppe wurde erstellt!"}
        else:
            return JSONResponse(status_code=400, content={"detail": "Gruppe existiert bereits. Bitte einen anderen Namen eingeben"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))    




if __name__ == "__main__":
     os.system("uvicorn main:app --reload")

# if __name__ == '__main__':
#     uvicorn.run(app, host='0.0.0.0', port=8000)


 