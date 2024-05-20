# src/plot.py
import matplotlib.pyplot as plt
import numpy as np
import os
from database import Database

db = Database('sqlite:///database.db')
n = 0


def generate_plot():
    # Fetch data from the database
    global n
    data = db.get_table()
    
    # Assuming data is a list of tuples, extract the columns you need
    rows = [row[1] for row in data]
    balls = [row[2] for row in data]
    probability_left = [row[3] for row in data]
    probability_right = [row[4] for row in data]

    # Example plot
    plt.figure()
    plt.plot(rows, balls, label="Balls vs Rows")
    plt.plot(rows, probability_left, label="Probability Left")
    plt.plot(rows, probability_right, label="Probability Right")
    plt.xlabel("Rows")
    plt.ylabel("Values")
    plt.legend()
    plt.title("Database Data Plot")

    n+=1

    # Save the plot to the static directory
    plot_dir = "frontend/plots"
    os.makedirs(plot_dir, exist_ok=True)
    plot_path = os.path.join(plot_dir, "plot"+ str(n) +".png")
    plt.savefig(plot_path)
    plt.close()
    
    return "plot"+ str(n)+ ".png"
