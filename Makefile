build: build-app build-web

build-app:
	go build cmd/app.go

build-web:
	cd ./web && yarn build

clean:
	rm app *.exe; cd ./web && yarn clean