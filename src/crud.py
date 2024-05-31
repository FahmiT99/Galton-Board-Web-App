from sqlalchemy.orm import Session
from models import *
from schemas import *
import os, shutil

"""
This module includes reusable CRUD functions
to interact with the data in the database.

"""


def check_group_id_exists(db : Session, group_id: str) -> bool:
    return db.query(Group).filter_by(group_id=group_id).first() is not None



def get_group_data(db : Session, group_id:str): 
    return db.query(Group).filter_by(group_id=group_id).first().data



def get_user_data(db : Session, user_id:str): 
    return db.query(User).filter_by(user_id=user_id).first().data 
   


def create_group(db: Session, group_create: GroupCreate) -> bool:

    if not check_group_id_exists(db, group_create.group_id):

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

    if  check_group_id_exists(db, data_create.group_id):
        new_data = Data(**data_create.model_dump())
        try:
            db.add(new_data)          
            db.commit()              
            db.refresh(new_data)      
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
