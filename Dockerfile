# This docker image will run the nexus interface.
# I am including some notes so we can continue to develop this.
#ENV sets an environment variable available within the container, useful for setting variables that software needs to run.
#VOLUME defines a path in the container that Docker exposes to the host system and mapped using the -v argument when running a container.
#WORKDIR changes the active directory of the container to a specified location, in case you need to run commands from or in a particular location.

FROM debian:latest
# Ok from a fresh install what would i need?
RUN apt-get update
# TOOLS:
RUN apt-get install -y curl
RUN apt install -y git-all


# Dependencies
RUN apt-get install -y gnupg
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - && apt-get install -yq nodejs build-essential
# RUN apt-get install -y nodejs
RUN apt-get install -y npm
# RUN apt-get install -y build-essential

#  TODO: Clean these up.
RUN apt-get -y install libgtkextra-dev libgconf2-dev libnss3 libasound2 libxtst-dev libxss1 libx11-xcb-dev
RUN apt-get install -y libgdk-pixbuf2.0-dev
# Username and password w's push it off screen.
ENV T_INT_URL_wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww https://resistance-is-futile:Eagmm4kk8893!@github.com/Nexusoft/Nexus-Interface-React.git
RUN git clone $T_INT_URL_wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww && cd Nexus-Interface-React && git checkout ReactPort
WORKDIR /Nexus-Interface-React
RUN npm install --save-dev cross-env
RUN npm install
RUN ls
RUN chmod a+x ./node_modules/
RUN npm run build-dll
# RUN npm run start-renderer-dev
# RUN cd Nexus-Interface-React && npm run start-main-dev
# RUN npm update
