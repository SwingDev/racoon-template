SERVICENAME = racoon
BASENAME = swingdevelopment/$(SERVICENAME)
SHA1 = $(shell git rev-parse HEAD)
TAG = $(TAG_PREFIX)_$(SHA1)

.PHONY: build test push auth_gcr tag_gcr push_gcr deploy_gcr deploy_swarm

all: build

build:
	docker build -t $(BASENAME):$(TAG) -f Dockerfile .

test:
	docker run $(DOCKER_RUN_TEST_PARAMS) $(BASENAME):$(TAG) npm run coverage

push:
	docker push $(BASENAME):$(TAG)

auth_gcr:
	echo $(GCLOUD_SERVICE_KEY) | base64 --decode > ${HOME}/gcloud-service-key.json
	gcloud auth activate-service-account --key-file ${HOME}/gcloud-service-key.json
	gcloud config set project $(GCLOUD_PROJECT)

tag_gcr: auth_gcr
	docker tag $(BASENAME):$(TAG) gcr.io/$(GCLOUD_PROJECT)/$(SERVICENAME):$(TAG)

push_gcr: tag_gcr
	gcloud docker -- push gcr.io/$(GCLOUD_PROJECT)/$(SERVICENAME):$(TAG)

deploy_gcr: push_gcr
	git clone --depth=1 git@github.com:SwingDev/swg-sonic-deployment.git
	mv ./swg-sonic-deployment/$(SERVICENAME)/$(GCLOUD_PROJECT).yaml ./app.yaml
	rm -rf ./swg-sonic-deployment
	gcloud app deploy -q --image-url gcr.io/$(GCLOUD_PROJECT)/$(SERVICENAME):$(TAG) --no-promote

deploy_and_promote_gcr: push_gcr
	git clone --depth=1 git@github.com:SwingDev/swg-sonic-deployment.git
	mv ./swg-sonic-deployment/$(SERVICENAME)/$(GCLOUD_PROJECT).yaml ./app.yaml
	rm -rf ./swg-sonic-deployment
	gcloud app deploy -q --image-url gcr.io/$(GCLOUD_PROJECT)/$(SERVICENAME):$(TAG) --promote --stop-previous-version

deploy_swarm:
	docker save $(BASENAME):$(TAG) | ssh $(SWARM_SSH_ADDRESS) 'docker load'
	ssh $(SWARM_SSH_ADDRESS) 'docker service update --image $(BASENAME):$(TAG) app'
