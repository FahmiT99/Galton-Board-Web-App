from sqlalchemy.orm import Session
from sqlalchemy import  Table, delete
from models import *
from schemas import *
from database import engine

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
            return True   
        except:
            db.rollback()
            raise 
        finally:
            db.close()
    else:
        # If the group ID already exists, return False
        return False




def save_data(db: Session, data_create: DataCreate) -> Data:

    new_data = Data(**data_create.model_dump())
    try:
        db.add(new_data)          
        db.commit()              
        db.refresh(new_data)      
    except:
        db.rollback()             
        raise                   
    finally:
        db.close()               
    return new_data


    

def reset_data(db : Session):
    table1 = Table("data", Base.metadata, autoload_with=engine)
    table2 = Table("groups", Base.metadata, autoload_with=engine)
    query1 = delete(table1)
    query2 = delete(table2)
    try:
        db.execute(query1)
        db.execute(query2)
        db.commit()
    except:
        db.rollback()
        raise
    finally:
        db.close()



# delete rows of a group after a certain time
def delete_group_data(db : Session, group_id):
    try:
        query = delete(Data).where(Data.group_id == group_id)
        query_2 = delete(Group).where(Group.group_id == group_id)
        db.execute(query)
        db.commit()
        db.execute(query_2)
        db.commit()
    except:
        db.rollback()
        raise
    finally:
        db.close()     