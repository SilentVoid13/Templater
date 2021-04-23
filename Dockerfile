FROM node:15
RUN apt update

# This is all the stuff obsidian needs to run
RUN apt -y install \
    xvfb \
    libgtk-3-0 \
    libnotify4 \
    libnss3 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    libatspi2.0-0 \
    libuuid1 \
    libappindicator3-1 \
    libsecret-1-0 \
    libasound2 \
    git

RUN groupadd -r obsidian && useradd --no-log-init -r -g obsidian obsidian
RUN mkdir /app
RUN mkdir /home/obsidian
RUN chown -R obsidian:obsidian /app /home/obsidian
WORKDIR /app

# Install obsidian
RUN curl -OL https://github.com/obsidianmd/obsidian-releases/releases/download/v0.11.13/Obsidian-0.11.13.AppImage
RUN mv Obsidian-0.11.13.AppImage /obsidian.AppImage
RUN chmod +x /obsidian.AppImage
RUN cd / && /obsidian.AppImage --appimage-extract
RUN mv /squashfs-root /obsidian
RUN chown -R obsidian:obsidian /obsidian
RUN chown root /obsidian/chrome-sandbox
RUN chmod 4755 /obsidian/chrome-sandbox

# Setup nodejs
ADD --chown=obsidian:obsidian package.json /app/package.json
#ADD --chown=obsidian:obsidian yarn.lock /app/yarn.lock
RUN su - obsidian -c "cd /app && yarn"
ADD --chown=obsidian:obsidian . .

# Setup X
USER obsidian
ENV DISPLAY :99
CMD xvfb-run yarn test
