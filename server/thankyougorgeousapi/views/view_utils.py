import string
import random
import datetime


def calc_missing_props(req_body, missing_props):
    '''calculates missing request body properties'''
    missing = [
        prop
        for prop in missing_props
        if prop not in req_body or str(req_body[prop]).strip() == ''
    ]
    if missing:
        return f'''Missing propert{'y' if len(missing) == 1 else 'ies'}: {', '.join(missing)}'''
    return None


def generate_verification_code(length=6):
    '''generates random verification code'''
    characters = string.ascii_uppercase + string.digits

    code = ''.join(random.choice(characters) for _ in range(length))

    return code


def get_date_info(datetime_str=None):
    if datetime_str:
        try:
            # try parsing with date and time
            datetime_obj = datetime.datetime.strptime(datetime_str, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            # try parsing with only date
            datetime_obj = datetime.datetime.strptime(datetime_str, '%Y-%m-%d')
    else:
        datetime_obj = datetime.datetime.now()

    year = datetime_obj.year
    month = datetime_obj.strftime('%B')
    month_num = datetime_obj.month
    day = datetime_obj.day
    weekday = datetime_obj.strftime('%A')
    datetime_str = datetime_obj.strftime('%Y-%m-%d %H:%M:%S')
    time = datetime_obj.strftime('%H:%M')
    hour = datetime_obj.strftime('%I')
    minute = datetime_obj.strftime('%M')
    am_pm = datetime_obj.strftime('%p').lower()
    mer_time = f'''{hour.lstrip('0')}:{minute}{am_pm}'''
    date_str = datetime_obj.strftime('%Y-%m-%d')

    date_info = {
        'year': year,
        'month': month,
        'month_num': month_num,
        'day': day,
        'weekday': weekday,
        'datetime': datetime_str,
        'date': date_str,
        'time': time,
        'mer_time': mer_time,
    }

    return date_info


def update_object_attributes(obj, attributes):
    for attr, value in attributes.items():
        if hasattr(obj, attr):
            # only update if attribute exists in model
            if isinstance(value, str):
                # trim strings
                setattr(obj, attr, value.strip())
            else:
                setattr(obj, attr, value)
