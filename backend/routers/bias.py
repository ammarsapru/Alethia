import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()
path = os.getenv("BIASEDATA_PATH")
absolute_path = os.path.join(os.path.dirname(__file__), path)
bias_dataset = pd.read_csv(absolute_path)

def bias_split(bias_Data):
    score = {}

    for source in bias_Data:
        if source in bias_dataset['source'].values:
            bias = bias_dataset.loc[bias_dataset['source'] == source, 'bias'].values[0]
            if bias and bias in score:
                score[bias] += 1
            else:
                score[bias] = 1

    total = sum(score.values())
    values_bias = {}

    if total == 0:
        values_bias["no matches"] = 100.0
    else:
        for key, value in score.items():
            percentage = (value / total) * 100
            values_bias[key] = percentage

    return values_bias
# print(bias_dataset.head())  # Display the first few rows of the DataFrame