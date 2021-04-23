all: build run

buid:
	sudo docker build -t templater-obsidian .
run:
	sudo docker run -i --rm --security-opt seccomp=$(CURDIR)/chrome.json templater-obsidian
run-shell:
	sudo docker run -i --rm --security-opt seccomp=$(CURDIR)/chrome.json templater-obsidian bash
