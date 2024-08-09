from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

"""
This module defines SQLAlchemy data models for our web application. 
It includes classes, representing users, groups, and associated data. 
Relationships between these models enable efficient data retrieval and manipulation

"""
class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String, index=True, unique=True)
    data_count = Column(Integer, default=0)

    user_plots = relationship('UserPlots', backref='users')

    def __repr__(self) -> str:
        return f"<User(id={self.id}, user_id={self.user_id}, data_count={self.data_count})>"


class Group(Base):
    __tablename__ = 'groups'

    id = Column(Integer, primary_key=True)
    group_id = Column(String, index=True, unique=True)

    group_plots = relationship('GroupPlots', backref='groups')
    
    def __repr__(self) -> str:
        return f"<Group(id={self.id}, group_id={self.group_id})>"


class UserPlots(Base):
    __tablename__ = "user_plots"

    id = Column(Integer, primary_key=True)
    user_id = Column(String, ForeignKey("users.user_id"), index=True)
    plot_path = Column(String)


class GroupPlots(Base):
    __tablename__ = "group_plots"

    id = Column(Integer, primary_key=True)
    group_id = Column(String, ForeignKey("groups.group_id"), index=True)
    plot_path = Column(String)


