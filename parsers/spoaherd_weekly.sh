uri='https://www.spoarherd-gastropub.com/menus'
curl $uri > spoaherd_weekly.txt
cat spoaherd_weeky.txt | tr '\n' ' ' | grep -E -o '<p[^<]*' | grep -E -o '>([a-zA-Z][a-z]|&euro).*' | sed -E 's/>Mehr/ /' | sed -E 's/>//' | sed -E 's/&euro;/€/g' | sed -E 's/\&uuml;/ü/g' | sed -E 's/\&auml;/ä/g' | sed -E 's/\$ouml;/ö/g'| sed -E 's/&nbsp;/ /g' | grep -o -E '.{2,}' > spoaherd_menu_weekly.txt