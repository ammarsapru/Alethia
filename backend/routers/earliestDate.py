from datetime import datetime

def is_valid_date(text, fmt="%Y-%m-%d"):
    try:
        datetime.strptime(text, fmt)
        return True
    except ValueError:
        return False

def earliestDate(url_dates):
    earliestDate = ''
    for i in range(len(url_dates)):
        if is_valid_date(url_dates[i]):
            if not is_valid_date(earliestDate):
                earliestDate = url_dates[i]
            elif url_dates[i] < earliestDate:
                earliestDate = url_dates[i]
    return earliestDate