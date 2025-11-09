import pandas as pd

def import_csv_to_dataframe(file_path):
    """
    Imports a CSV file and stores it as a pandas DataFrame.

    Args:
        file_path (str): The path to the CSV file.

    Returns:
        pandas.DataFrame: A DataFrame containing the CSV data.
                          Returns None if an error occurs.
    """
    try:
        df = pd.read_csv(file_path)
        return df
    except FileNotFoundError:
        print(f"Error: The file '{file_path}' was not found.")
        return None
    except pd.errors.EmptyDataError:
        print(f"Error: The file '{file_path}' is empty.")
        return None
    except Exception as e:
        print(f"An error occurred while reading the CSV: {e}")
        return None

# --- Usage ---
csv_file_path = 'mbfc.csv' # Using the same dummy file from above

my_csv_data_df = import_csv_to_dataframe(csv_file_path)

print(my_csv_data_df.head())  # Display the first few rows of the DataFrame