from sqlalchemy import Column, Integer, String, create_engine, JSON, Table, select, delete, inspect
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

Base = declarative_base()

class GroupIDs(Base):
    __tablename__ = 'group_IDs'
    id = Column(Integer, primary_key=True)
    group_id = Column(String, index=True, unique=True)


class Data(Base):
    __tablename__ = "data"
    id = Column(Integer, primary_key=True)
    group_id = Column(String, index=True) 
    rows = Column(Integer)
    balls = Column(Integer)
    probabilityLeft = Column(Integer)
    probabilityRight = Column(Integer)
    stats = Column(JSON)

    # def __repr__(self, group_id, rows, balls, probabilityLeft, probabilityRight, stats):
    #     self.group_id = group_id
    #     self.rows = rows
    #     self.balls = balls
    #     self.probabilityLeft = probabilityLeft
    #     self.probabilityRight = probabilityRight
    #     self.stats = stats


    def __repr__(self):
        return (f"<Data(id={self.id}, group_id={self.group_id}, rows={self.rows}, "
                f"balls={self.balls}, probabilityLeft={self.probabilityLeft}, "
                f"probabilityRight={self.probabilityRight}, stats={self.stats})>")





class Database:
    def __init__(self, db_url):
        self.engine = create_engine(db_url, poolclass=NullPool)
        Base.metadata.create_all(bind=self.engine)
        self.session = sessionmaker(bind=self.engine)    

    #TODO: close sessions   
    def check_group_id_exists(self, group_id: str) -> bool:
        session = self.session() 
        return session.query(GroupIDs).filter_by(group_id=group_id).first() is not None

    def get_group_data(self, group_id:str): 
        session = self.session()  
        data = session.query(Data).filter_by(group_id=group_id).all() 
        session.close()
        return data 
    

    def create_group(self, group_id: str, **kwargs):
        session = self.session() 
        if not self.check_group_id_exists(group_id):
            try:
                new_group = GroupIDs(group_id=group_id, **kwargs)
                session.add(new_group)
                session.commit()
                session.refresh(new_group)       # Refresh the instance of Data to update its id attribute
            except:
                session.rollback()        # If there's an error, roll back the session
                raise
            finally:
                session.close()   
            return True
        else:
            return False  # Group ID already exists



    def saveData(self, group_id, rows, balls, probabilityLeft, probabilityRight, stats):        
        session = self.session()        # Create a new Session
        data = Data(group_id = group_id, rows=rows, balls=balls, probabilityLeft=probabilityLeft, probabilityRight=probabilityRight, stats=stats)
        try:  
            session.add(data)          # Add the new instance of Data to the session
            session.commit()            # Commit the session to write the changes to the database
            session.refresh(data)       # Refresh the instance of Data to update its id attribute
        except:
            session.rollback()        # If there's an error, roll back the session
            raise
        finally:
            session.close()            # Close the session
        return data
    
     

    def reset_data(self):
        session = self.session()
        table = Table("data", Base.metadata, autoload_with=self.engine)
        query = delete(table)
        try:
            session.execute(query)
            session.commit()
        except:
            session.rollback()
            raise
        finally:
            session.close()

    # delete rows of a group after a certain time
    def delete_group_data(self, group_id):
        session = self.session()
        try:
            query = delete(Data).where(Data.group_id == group_id)
            query_2 = delete(GroupIDs).where(GroupIDs.group_id == group_id)
            session.execute(query)
            session.commit()
            session.execute(query_2)
            session.commit()
        except:
            session.rollback()
            raise
        finally:
            session.close()     
