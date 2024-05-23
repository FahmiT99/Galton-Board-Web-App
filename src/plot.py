# src/plot.py
import matplotlib.pyplot as plt
import numpy as np
import os

 
plot_counter = 0



def plot_galton_board(bin_counts, num_balls, prob_left, prob_right):
    num_bins = len(bin_counts)
    x_labels = range(num_bins)

    additional_info = f"Probability left = {prob_left}\n Probability right = {prob_right}" \
        f"\nAnzahl Bälle = {num_balls}"


    plt.bar(x_labels, bin_counts, width=0.8, edgecolor='black')
    plt.xticks(x_labels)  # Set x-axis labels to show both even and odd numbers
    plt.xlabel('Bins')
    plt.ylabel('Number of Balls')
    plt.title('Galton Board Simulation')

    plt.text(num_bins - 1, max(bin_counts), additional_info,
        horizontalalignment='right',
        verticalalignment='top',
        bbox=dict(facecolor='white', alpha=0.5))

    #plt.show()


def generate_plots(group_id ,data):
    # Fetch data from the database
    global plot_counter
    

    plot_dir = "frontend/plots"
    os.makedirs(plot_dir, exist_ok=True)
    #print(data)
    plot_paths = []

    # Assuming data is a list of tuples, extract the columns you need


    for row in data:
        plot_counter += 1
        id = row.id
        rows = row.rows
        balls = row.balls
        probability_left = row.probabilityLeft
        probability_right = row.probabilityRight#row[5]
        stats = row.stats


        plot_galton_board(stats, balls, probability_left, probability_right)


        # Save the plot to the static directory
        # plot_dir = "frontend/plots"
        # os.makedirs(plot_dir, exist_ok=True)
        # plot_path = os.path.join(plot_dir, "plot"+ str(n) +".png")
        # plt.savefig(plot_path)
        # plt.close()

        plot_path = os.path.join(plot_dir, f"{group_id}_{id}.png")
        plt.savefig(plot_path)
        plt.close()

        plot_paths.append(plot_path)
    
    #return "plot"+ str(n)+ ".png"

    return plot_paths

# generated_plots = generate_plots()
# print(generated_plots)
