from sqlalchemy.orm import Session
from models import *
from schemas import *
import os, shutil, json
from sqlalchemy import update, select

"""
This module includes reusable CRUD functions
to interact with the data in the database.

"""



def user_id_exists(db : Session, user_id: str) -> bool:
    return db.query(User).filter_by(user_id=user_id).first() is not None



def group_id_exists(db : Session, group_id: str) -> bool:
    return db.query(Group).filter_by(group_id=group_id).first() is not None



def get_group_data(db : Session, group_id: str): 
    return db.query(Group).filter_by(group_id=group_id).first().data



def get_user_data(db : Session, user_id: str): 
    return db.query(User).filter_by(user_id=user_id).first().data 



def get_user_data_counter(db : Session, user_id:str):
    return db.query(User).filter_by(user_id=user_id).first().data_count
   


def get_user_plots(db : Session, user_id: str): 
    user = db.query(User).filter_by(user_id=user_id).first()
    plot_paths = [row.plot_path for row in user.user_plots]
    return plot_paths

def get_group_plots(db : Session, group_id: str): 
    group = db.query(Group).filter_by(group_id=group_id).first()
    plot_paths = [row.plot_path for row in group.group_plots]
    return plot_paths


def add_plot_path(db: Session, data_create: DataCreate, plot_path: str):

    try:
        user_plot_path = UserPlots(user_id=data_create.user_id, plot_path=plot_path)
        group_plot_path = GroupPlots(group_id=data_create.group_id, plot_path=plot_path)
        db.add(user_plot_path)
        db.add(group_plot_path)
        db.commit()  
        db.refresh(user_plot_path)
        db.refresh(group_plot_path)
    except:
        db.rollback()             
        raise



def create_user(db: Session, user_create: UserCreate) -> bool:

    if not user_id_exists(db, user_create.user_id):

        # Create a new user instance from the Pydantic model
        new_user = User(user_id=user_create.user_id)
        try:
            db.add(new_user)
            db.commit()
            db.refresh(new_user)    
        except:
            db.rollback()
            raise 
        return True 
    else:
        # If the user ID already exists, return False
        return False
    


def create_group(db: Session, group_create: GroupCreate) -> bool:

    if not group_id_exists(db, group_create.group_id):

        # Create a new Group instance from the Pydantic model
        new_group = Group(group_id=group_create.group_id)
        try:
            db.add(new_group)
            db.commit()
            db.refresh(new_group)    
        except:
            db.rollback()
            raise 
        return True 
    else:
        # If the group ID already exists, return False
        return False



def save_data(db: Session, data_create: DataCreate) -> bool:

    if  group_id_exists(db, data_create.group_id) and user_id_exists(db, data_create.user_id):
        new_data = Data(**data_create.model_dump())
        try:
            db.add(new_data)          
            db.commit()              
            db.refresh(new_data)  

             # Update the data count for the user
            user = db.query(User).filter_by(user_id=data_create.user_id).first()
            user.data_count += 1
            db.commit()   
        except:
            db.rollback()          
            raise
        return True
    else:
        return False                                 


    
def reset_db_entries(db : Session):
    try:
        db.query(Data).delete()
        db.query(Group).delete()
        db.query(User).delete()
        db.commit()
    except:
        db.rollback()
        raise
    finally:
        db.close()
    


def reset_data(db: Session):

    reset_db_entries(db)
    plot_dir = "frontend/plots"
    # Remove the directory if it exists
    if os.path.exists(plot_dir):
        shutil.rmtree(plot_dir)
        os.makedirs(plot_dir)
