build:
	docker build -t scraping-service:dev -f Dockerfile .

run:
	docker run --rm\
		--env-file .env \
		-v $(HOME)/.aws/:/root/.aws/ \
		-v $(PWD):/appreciate-monorepo/services/scraping-service \
		scraping-service:dev \
		npm start

shell:
	docker run --rm -it\
		--env-file .env \
		-v $(HOME)/.aws/:/root/.aws/ \
		scraping-service:dev \
		/bin/bash

get-file:
	aws --endpoint-url http://host.docker.internal:4566 s3api get-object --bucket scraping.appreciate.it --key ${BRAND}_handbags.json output/${BRAND}_s3.json

start-docs:
	docker-compose up -d

stop-docs:
	docker-compose down

update-docs:
	npx typedoc --entryPointStrategy expand src/ --out docs/scraping-service