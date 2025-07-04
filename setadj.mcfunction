tag @e[c=2] add "wborder:adjust"
tag @s remove "wborder:adjust"
tellraw @s {"rawtext":[{"selector":"@s[tag=wborder:adjust]"},{"text":"への付与に成功しました。"}]}