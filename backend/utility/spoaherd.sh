uri="https://apps.wixrestaurants.com/?type=wixmenus.client&pageId=alvp0&compId=TPASection_jppw3z19&viewerCompId=TPASection_jppw3z19&siteRevision=797&viewMode=site&deviceType=desktop&locale=de&tz=Europe/Vienna&regionalLanguage=de&width=980&height=6027&instance=J3eLRPdbY3-IIPUXlm3hvMZKDZa0nTHncrnBhC7X50c.eyJpbnN0YW5jZUlkIjoiOTZhMDMzZGQtZTEwYS00ZmE2LWE2OWQtNmJiMmU0Y2QwMTA4IiwiYXBwRGVmSWQiOiIxM2MxNDAyYy0yN2YyLWQ0YWItNzQ2My1lZTdjODllMDc1NzgiLCJtZXRhU2l0ZUlkIjoiZDgzOTViNjItNzcxMy00OWM4LWIyYzAtOTk1MjkzZjIyZmZmIiwic2lnbkRhdGUiOiIyMDIzLTEwLTE4VDE4OjUyOjIyLjMxNVoiLCJ2ZW5kb3JQcm9kdWN0SWQiOiJyZXN0X3BybyIsImRlbW9Nb2RlIjpmYWxzZSwiYWlkIjoiYWIyYWRjZjAtOWM1MS00ZWE4LTk0MWItZjlhYjQ2N2RlZjcxIiwiYmlUb2tlbiI6IjRlOTk2OGJmLTk2MTktMDY2ZS0xNDVkLWYyZTA3NzNmMmVmNyIsInNpdGVPd25lcklkIjoiY2I2YTI3MzgtMDI2ZC00M2UwLWFiYjQtZTk4ZWFlOWNiMGRmIn0&currency=EUR&currentCurrency=EUR&currentRoute=./menus&target=_top&section-url=https://www.spoarherd-gastropub.com/menus/&vsi=0f938411-724a-4193-ae2f-48bbb7fe8c87" 
curl -s $uri > spoaherd.txt
grep -o -E '<(div|span)[^>]*data-hook=\"wixrest-menus-item-title\"[^<]*|<div[^>]*data-hook=\"wixrest-menus-item-price\"[^<]*' spoaherd.txt | sed -E 's/<[^>]*>/ /' | sed -E 's/&quot;//g' | sed -E 's/ / /g' | sed -E 's/€//g'| sed -E 's/,/./g'   > spoaherd_menu.txt

uri_weekly='https://www.spoarherd-gastropub.com/menus'
curl -s $uri_weekly > spoaherd_weekly.txt
cat spoaherd_weekly.txt | tr '\n' ' ' | grep -E -o '<p[^<]*' | grep -E -o '>([a-zA-Z][a-z]|&euro).*' | sed -E 's/>Mehr/ /' | sed -E 's/>//' | sed -E 's/&euro;/€/g' | sed -E 's/\&uuml;/ü/g' | sed -E 's/\&auml;/ä/g' | sed -E 's/\&ouml;/ö/g'| sed -E 's/&nbsp;/ /g' | sed -E 's/€//g' | sed -E 's/,/./g' | grep -o -E '.{2,}' > spoaherd_menu_weekly.txt

echo "[" > spoaherd_parsed.json

i=1
while IFS= read -r line
do
  if [ `expr $i % 2` -eq 1 ]
  then
    if [ `expr $i` -gt 1 ]
    then
        echo ",\n" >> spoaherd_parsed.json
    fi
    echo "{\"name\":\"$line\"," >> spoaherd_parsed.json
  else
    echo "\"price\":$line}" >> spoaherd_parsed.json
  fi
  i=$((i+1))
done < "spoaherd_menu.txt"

while IFS= read -r line
do
  if [ -z "${line##*Wunsch*}" ]; then
    break
  fi
  if [ `expr $i % 2` -eq 1 ]
  then
    if [ `expr $i` -gt 1 ]
    then
        echo ",\n" >> spoaherd_parsed.json
    fi
    echo "{\"name\":\"$line\",\"tag\":\"wochnspeis\"," >> spoaherd_parsed.json
  else
    echo "\"price\":$line}" >> spoaherd_parsed.json
  fi
  i=$((i+1))
done < "spoaherd_menu_weekly.txt"

echo "]" >> spoaherd_parsed.json

rm spoaherd.txt
rm spoaherd_weekly.txt
rm spoaherd_menu.txt
rm spoaherd_menu_weekly.txt

cat spoaherd_parsed.json

rm spoaherd_parsed.json