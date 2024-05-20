from sqlalchemy import Column, Integer, String, create_engine, JSON, Table, select, delete
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

Base = declarative_base()

class Data(Base):
    __tablename__ = "data"

    id = Column(Integer, primary_key=True)
    #groupID = Column(Integer, secondary_key=True)
    rows = Column(Integer)
    balls = Column(Integer)
    probabilityLeft = Column(Integer)
    probabilityRight = Column(Integer)
    stats = Column(JSON)

    def __repr__(self, rows, balls, probabilityLeft, probabilityRight, stats):
        self.rows = rows
        self.balls = balls
        self.probabilityLeft = probabilityLeft
        self.probabilityRight = probabilityRight
        self.stats = stats
        



class Database:
    def __init__(self, db_url):
        self.engine = create_engine(db_url, poolclass=NullPool)
        Base.metadata.create_all(bind=self.engine)
        self.session = sessionmaker(bind=self.engine)

    def saveData(self, rows, balls, probabilityLeft, probabilityRight, stats):        
        session = self.session()        # Create a new Session
      
        data = Data(rows=rows, balls=balls, probabilityLeft=probabilityLeft, probabilityRight=probabilityRight, stats=stats)
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
    
    def get_table(self):
        session = self.session()
        table = Table("data",Base.metadata,autoload_with=self.engine)
        query = select(table)
        result = session.execute(query)
        rows = result.fetchall()
        
        data = [list(row) for row in rows]

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