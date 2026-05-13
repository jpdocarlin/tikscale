import urllib.request
import re

video_ids = ['x-zkUqn2DO8', 'gMxvxgzNGq4', 'XqHjh_CGyW4', 'zaZYIi8aMGY', '7HAnQDruQbw', 'MHLJqKlz_eA', 'sppdl7s-F58']

for vid in video_ids:
    url = f"https://www.youtube.com/watch?v={vid}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        title_match = re.search(r'<title>(.*?)</title>', html)
        title = title_match.group(1).replace(" - YouTube", "") if title_match else "Unknown"
        
        length_match = re.search(r'"lengthSeconds":"(\d+)"', html)
        if length_match:
            seconds = int(length_match.group(1))
            duration = f"{seconds//60:02d}:{seconds%60:02d}"
        else:
            duration = "00:00"
            
        print(f"{vid}: {title} | {duration}")
    except Exception as e:
        print(f"Error for {vid}: {e}")
