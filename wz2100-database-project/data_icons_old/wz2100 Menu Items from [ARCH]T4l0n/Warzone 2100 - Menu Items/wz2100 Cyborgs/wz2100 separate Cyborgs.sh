#!/bin/bash
echo -e "\e[93mCreating directory \e[97m'wz2100 Cyborgs separated'\e[93m in your home directory."
mkdir "$HOME/wz2100 Cyborgs separated"
echo -e "\e[93mExtracting images using ImageMagick to the folder previously created."
convert "c1 Base.png" -crop 60x46+3+30\!   -channel rgba -fill none -opaque "#080840" "$HOME/wz2100 Cyborgs separated/c1 L-A Machinegunner.tif"
convert "c1 Base.png" -crop 60x46+3+78\!   -channel rgba -fill none -opaque "#080840" "$HOME/wz2100 Cyborgs separated/c1 L-B Heavy Gunner.tif"
convert "c1 Base.png" -crop 60x46+3+126\!  -channel rgba -fill none -opaque "#080840" "$HOME/wz2100 Cyborgs separated/c1 L-C Assault Gunner.tif"
convert "c1 Base.png" -crop 60x46+3+174\!  -channel rgba -fill none -opaque "#080840" "$HOME/wz2100 Cyborgs separated/c1 L-D Flashlight Gunner.tif"
convert "c1 Base.png" -crop 60x46+3+222\!  -channel rgba -fill none -opaque "#080840" "$HOME/wz2100 Cyborgs separated/c1 L-E Thermite Flamer.tif"
convert "c1 Base.png" -crop 60x46+65+30\!  -channel rgba -fill none -opaque "#080840" "$HOME/wz2100 Cyborgs separated/c1 R-A Cyborg Flamer.tif"
convert "c1 Base.png" -crop 60x46+65+78\!  -channel rgba -fill none -opaque "#080840" "$HOME/wz2100 Cyborgs separated/c1 R-B Lancer.tif"
convert "c1 Base.png" -crop 60x46+65+126\! -channel rgba -fill none -opaque "#080840" "$HOME/wz2100 Cyborgs separated/c1 R-C Scourge.tif"
convert "c1 Base.png" -crop 60x46+65+174\! -channel rgba -fill none -opaque "#080840" "$HOME/wz2100 Cyborgs separated/c1 R-D Needle Gunner.tif"
convert "c1 Base.png" -crop 60x46+65+222\! -channel rgba -fill none -opaque "#080840" "$HOME/wz2100 Cyborgs separated/c1 R-E Grenadier.tif"
convert "c2 Base.png" -crop 60x46+3+30\!   -channel rgba -fill none -opaque "#080840" "$HOME/wz2100 Cyborgs separated/c2 L-A Combat Engineering.tif"
convert "c2 Base.png" -crop 60x46+3+78\!   -channel rgba -fill none -opaque "#080840" "$HOME/wz2100 Cyborgs separated/c2 L-B Super Heavy-Gunner.tif"
convert "c2 Base.png" -crop 60x46+3+126\!  -channel rgba -fill none -opaque "#080840" "$HOME/wz2100 Cyborgs separated/c2 L-C Super Tank-Killer Cyborg.tif"
convert "c2 Base.png" -crop 60x46+3+174\!  -channel rgba -fill none -opaque "#080840" "$HOME/wz2100 Cyborgs separated/c2 L-D Super Pulse Laser Cyborg.tif"
convert "c2 Base.png" -crop 60x46+3+222\!  -channel rgba -fill none -opaque "#080840" "$HOME/wz2100 Cyborgs separated/c2 L-E Super Scourge Cyborg.tif"
convert "c2 Base.png" -crop 60x46+65+30\!  -channel rgba -fill none -opaque "#080840" "$HOME/wz2100 Cyborgs separated/c2 R-A Cyborg Mechanic.tif"
convert "c2 Base.png" -crop 60x46+65+78\!  -channel rgba -fill none -opaque "#080840" "$HOME/wz2100 Cyborgs separated/c2 R-B Super Auto-Cannon Cyborg.tif"
convert "c2 Base.png" -crop 60x46+65+126\! -channel rgba -fill none -opaque "#080840" "$HOME/wz2100 Cyborgs separated/c2 R-C Super HPV Cyborg.tif"
convert "c2 Base.png" -crop 60x46+65+174\! -channel rgba -fill none -opaque "#080840" "$HOME/wz2100 Cyborgs separated/c2 R-D Super Rail-Gunner.tif"
echo -e "\e[93mCoping script \e[97m'wz2100 rename Cyborgs.sh'\e[93m to the folder previously created."
cp "wz2100 rename Cyborgs.sh" "$HOME/wz2100 Cyborgs separated"
echo -e "\e[92mBatch process completed!"