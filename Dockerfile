FROM debian:latest
# TOOLS/Dependencies:
RUN apt-get -y install \
libgtkextra-dev \
libgconf2-dev \
libnss3 \
libasound2 \
libxtst-dev \
libxss1 \
libx11-xcb-dev \
libgdk-pixbuf2.0-dev \
xvfb \
gnupg \
nodejs \
npm \
build-essential \
libboost-all-dev \
libdb-dev \
libdb++-dev \
libssl1.0-dev \
libminiupnpc-dev \
libqrencode-dev \
qt4-qmake \
libqt4-dev \
lib32z1-dev \
curl \
wget \
git-all

# GIT everything we need for this to run.
# redacted password below
ENV Tritium_Interface_URL https://username:password!@github.com/Nexusoft/Nexus-Interface-React.git
RUN git clone $Tritium_Interface_URL && cd Nexus-Interface-React && git checkout testingDocker

ENV Nexus_URL https://github.com/Nexusoft/Nexus.git
RUN git clone $Nexus_URL

# Setup Interface
WORKDIR /Nexus-Interface-React
# Get the newest geiop. rip it into the right directory
RUN cd app/GeoLite2-City_20180403 && wget http://geolite.maxmind.com/download/geoip/database/GeoLite2-City.tar.gz && tar -zxvf GeoLite2-City*.tar.gz --wildcards */GeoLite2-City.mmdb --directory ./ --strip-components 1 && ls

RUN npm update
RUN npm install --save cross-env

RUN npm run build-dll

# Setup Nexus
WORKDIR /Nexus
RUN apt-get update && apt-get -yq install \
    build-essential libboost-all-dev libdb-dev libdb++-dev libssl1.0-dev \
    libminiupnpc-dev libqrencode-dev qt4-qmake libqt4-dev lib32z1-dev
RUN make -f makefile.cli

# Setup .Nexus
# figure out how to create the .Nexus/nexus.conf file before starting the daemon.

# Setup environment variables for the whole vm. symbolic links to the newly created nexus daemon and the start script for it.
