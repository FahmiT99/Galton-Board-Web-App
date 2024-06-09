 
from pydantic import BaseModel

"""
this module creates Pydantic models (schemas) 
that will be used when reading data from the API

"""


class UserCreate(BaseModel):
    user_id: str

class GroupCreate(BaseModel):
    group_id: str

class DataCreate(BaseModel):
    user_id: str
    group_id: str
    rows: int
    balls: int
    probabilityLeft: float
    probabilityRight: float
    stats: list
