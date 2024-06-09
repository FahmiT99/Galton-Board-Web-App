# src/plot.py
import matplotlib
matplotlib.use('Agg')
from matplotlib import pyplot as plt
import os



def plot_galton_board(rows, balls, probability_left, probability_right, stats):

    x_labels = range(rows)

   # additional_info = f"Wahrscheinlichkeit {int(probability_left*100)} % | {int(probability_right*100)} % " \
    #    f"           Anzahl Bälle = {balls}"
    additional_info = f" {int(probability_left*100)} %  |  {int(probability_right*100)} % " \
       f"\nBälle  =  {balls}"

    plt.bar(x_labels, stats, width=0.8, edgecolor='black')
    plt.xticks(x_labels)  # Set x-axis labels to show both even and odd numbers
    plt.xlabel("Reihen")
    plt.ylabel('Bälle')
    plt.title('Galton Brett Experiment')

    plt.text(rows - 1, max(stats),additional_info,
        horizontalalignment='right',
        verticalalignment='top',
        bbox=dict(facecolor='white', alpha=0.5))



def generate_plots(data, user_data_counter):
    
    plot_dir = "frontend/plots"
    os.makedirs(plot_dir, exist_ok=True)

    plot_galton_board(data.rows, data.balls, data.probabilityLeft, data.probabilityRight, data.stats)
    plot_path = os.path.join(plot_dir, f"{data.user_id}_{data.group_id}_{user_data_counter}.png")
    plt.savefig(plot_path)
    plt.close()

    return plot_path
