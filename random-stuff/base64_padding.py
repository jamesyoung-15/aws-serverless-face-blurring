import base64

content = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII"
try:
    test =  base64.b64decode(content)
except Exception as e:
    print(e)
    test =  base64.b64decode(content+"===")