import matplotlib
matplotlib.use('Agg')
from matplotlib import pyplot as plt
import numpy as np
from scipy.stats import binom
import os

# Funktion zur Berechnung der theoretischen Verteilung
def theoretical_distribution(rows, balls, probability):
    bins = np.arange(rows)
    probs = [round(binom.pmf(k, rows-1, probability) * balls, 1) for k in bins]
    return probs

# Funktionen zur Berechnung der Abweichung
def MSE(actual, theoretical):
    squared_errors = np.sum((np.array(theoretical) - np.array(actual)) ** 2)
    mse = squared_errors / len(actual)
    return mse

def MAE(actual, theoretical):
    absolute_errors = np.abs(np.array(actual) - np.array(theoretical))
    sum_absolute_errors = np.sum(absolute_errors)
    mae = sum_absolute_errors / np.sum(actual)
    return [mae * 100, sum_absolute_errors]

def MAPE(actual, theoretical):
    actual, theoretical = np.array(actual), np.array(theoretical)
    mask = actual != 0
    return np.mean(np.abs((actual[mask] - theoretical[mask]) / actual[mask])) * 100

# Funktion zur Simulation der tatsächlichen Werte
def simulate_galton_board(rows, balls, probability):
    actual_stats = np.zeros(rows)
    for _ in range(balls):
        position = 0
        for _ in range(rows - 1):
            if np.random.rand() < probability:
                position += 1
        actual_stats[position] += 1
    return actual_stats

# Funktion zur Erstellung des Plots
def plot_galton_board(rows, balls, probability_left, probability_right, actual_stats, theoretical_stats, deviation, plot_path):
    deviation_percentage = deviation[0]
    deviation_sum = deviation[1]
    x_labels = range(rows)

    additional_info = f" {int(probability_left * 100)} %  |  {int(probability_right * 100)} % " \
                      f"\nTotal balls = {balls} \nAbweichung  =  {deviation_sum}\nin %  =  {round(deviation_percentage, 4)}"
    
    fig, ax = plt.subplots(figsize=(7, 5))

    # Plot the actual results
    ax.bar(x_labels, actual_stats, width=0.4, edgecolor='black', label='Actual', align='center')

    # Plot the theoretical distribution as a line plot
    ax.plot(x_labels, theoretical_stats, color='red', marker='o', linestyle='-', linewidth=2, markersize=5,
            label='Theoretical')

    ax.set_xticks(x_labels)
    ax.set_xlabel('Bins')
    ax.set_ylabel('Number of Balls')
    ax.set_title('Galton Board Simulation')

    # Add a legend
    ax.legend(loc='upper left', fontsize=8)

    ax.text(0.95, 0.95, additional_info, transform=ax.transAxes,
            fontsize=8, verticalalignment='top', horizontalalignment='right',
            bbox=dict(facecolor='white', alpha=0.5))

    # Adjust x-axis and y-axis limits for proper spacing
    ax.set_xlim(-0.5, rows - 0.5)
    ax.set_ylim(0, max(max(actual_stats), max(theoretical_stats)) * 1.2)

    # Adjust layout to ensure equal margins
    plt.subplots_adjust(left=0.2, right=0.8, top=0.85, bottom=0.15)

    plt.show()
    plt.savefig(plot_path, bbox_inches='tight', pad_inches=0.1)
    plt.close()

# Funktion zur Generierung und Benennung der Plots
def generate_plots(data, user_data_counter):
    plot_dir = "frontend/plots"
    os.makedirs(plot_dir, exist_ok=True)
    
    # Berechne theoretische Verteilung
    theoretical_stats = theoretical_distribution(data['rows'], data['balls'], data['probabilityRight'])
    
    # Simuliere tatsächliche Werte
    actual_stats = simulate_galton_board(data['rows'], data['balls'], data['probabilityRight'])
    
    # Berechne Abweichung
    deviation = MAE(actual_stats, theoretical_stats)
    
    # Benenne die Datei mit der Abweichung
    plot_path = os.path.join(plot_dir, f"{data['user_id']}_{data['group_id']}_{user_data_counter}_{deviation[0]}_{data["rows"]}.png")

    # Erstelle Plot
    plot_galton_board(data['rows'], data['balls'], data['probabilityLeft'], data['probabilityRight'], actual_stats, theoretical_stats, deviation, plot_path)
    
    return plot_path

# Datengenerator-Funktion zur Erstellung von Galton-Brett-Simulationen
def generate_galton_boards():
    user_id = "."
    group_id = "."
    user_data_counter = 0
    plot_paths = []  # Array to store plot paths

    for rows in range(2, 11):  # Rows from 2 to 10 (inclusive)
        for balls in list(range(10, 100, 10)) + list(range(100, 1100, 100)):  # Balls from 10 to 90, then 100 to 1000
            data = {
                'rows': rows,
                'balls': balls,
                'probabilityLeft': 0.5,
                'probabilityRight': 0.5,
                'user_id': user_id,
                'group_id': group_id
            }
            plot_path = generate_plots(data, user_data_counter)
            plot_paths.append(plot_path)  # Append the plot path to the array
            print(f"Generated plot at {plot_path}")
            user_data_counter += 1

    print(plot_paths)  # Print the array of plot paths

# Starten Sie die Generierung von Galton-Brett-Simulationen
generate_galton_boards()
