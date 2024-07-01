import matplotlib
matplotlib.use('Agg')
from matplotlib import pyplot as plt
import numpy as np
from scipy.stats import binom
import os



def theoretical_distribution(rows, balls, probability):

    bins = np.arange(rows) #K Versuche
    probs = [round(round(binom.pmf(k, rows-1, probability) * balls, 1)) for k in bins]
    return probs


# Funktion zur Berechnung der Abweichung
def calculate_deviation(actual, theoretical):
    absolute_errors = np.abs(np.array(actual) - np.array(theoretical))
    sum_absolute_errors = np.sum(absolute_errors)
    result = sum_absolute_errors / np.sum(actual)
    return [result*100, sum_absolute_errors]


# Funktion zur Erstellung des Plots
def plot_galton_board(rows, balls, probability_left, probability_right, actual_stats, prog_stats, theoretical_stats, deviation, plot_path):
   
    deviation_percentage = deviation[0]
    deviation_sum = deviation[1]
    x_labels = range(rows)

    additional_info = f" {int(probability_left*100)} %  |  {int(probability_right*100)} % " \
                      f"\nBälle gesamt = {balls} \nAbweichung  =  {round(deviation_sum)}\nin %  =  {round(deviation_percentage,4)}"
    
    
    fig, ax = plt.subplots(figsize=(7, 5))


    #Plot the actual results
    ax.bar(x_labels, actual_stats, width=0.2, edgecolor='black', label='Ergebnis', align='center')
    
    # Overlay the prognose results
    ax.bar(x_labels, prog_stats, width=0.2, edgecolor='black', color='orange', alpha=0.5, label='Prognose',
           align='edge')

    # Plot the theoretical distribution as a line plot
    ax.plot(x_labels, theoretical_stats, color='red', marker='o', linestyle='-', linewidth=2, markersize=5,
            label='Theoretische Verteilung')

    ax.set_xticks(x_labels)  # Set x-axis labels to show both even and odd number
    ax.set_xlabel('Behälter')
    ax.set_ylabel('Anzahl Bälle')
    ax.set_title('Galton Board Simulation')

     # Add a legend
    ax.legend(loc='upper left', fontsize=8)

    ax.text(0.95, 0.95, additional_info, transform=ax.transAxes,
        fontsize=8, verticalalignment='top', horizontalalignment='right',
        bbox=dict(facecolor='white', alpha=0.5))
    
    # Adjust x-axis and y-axis limits for proper spacing
    ax.set_xlim(-0.5, rows - 0.5)
    ax.set_ylim(0, max(max(prog_stats),max(actual_stats), max(theoretical_stats)) * 1.2)
     
    # Adjust layout to ensure equal margins
    plt.subplots_adjust(left=0.2, right=0.8, top=0.85, bottom=0.15)

    plt.savefig(plot_path, bbox_inches='tight', pad_inches=0.1) #>0.5 = 3 in a row
    plt.close()




# Funktion zur Generierung und Benennung der Plots
def generate_plots(data, user_data_counter):
    
    plot_dir = "frontend/plots"
    os.makedirs(plot_dir, exist_ok=True)
    
    # Berechne theoretische Verteilung
    theoretical_stats = theoretical_distribution(data.rows, data.balls,  data.probabilityRight)
    
    # Berechne Abweichung
    deviation = calculate_deviation(data.stats, theoretical_stats)
    
    # Benenne die Datei mit der Abweichung
    plot_path = os.path.join(plot_dir, f"{data.user_id}_{data.group_id}_{user_data_counter}_{deviation[0]}_{data.rows}.png")


    # Erstelle Plot
    plot_galton_board(data.rows, data.balls, data.probabilityLeft, data.probabilityRight, data.stats, data.prog_stats, theoretical_stats, deviation, plot_path)
    
    
   
    
    return plot_path

