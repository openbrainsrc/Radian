# See the README for installation instructions.

YUICOMPRESSOR = tools/yuicompressor-2.4.8pre.jar
UGLIFYJS = uglifyjs

all: radian.js radian.min.js radian.css examples

.INTERMEDIATE radian.js: \
	src/start.js \
	src/core.js \
	src/expressions.js \
	src/data.js \
	src/layout.js \
	src/plots.js \
	src/interpolation.js \
	src/lib.js \
	src/ui.js \
	src/utils.js \
	src/debug.js \
	src/end.js

radian.min.js: radian.js Makefile
	@rm -f $@
	$(UGLIFYJS) radian.js > $@

#	java -jar $(YUICOMPRESSOR) radian.tmp.js > $@

radian%js: Makefile
	@rm -f $@
	cat $(filter %.js,$^) > $@

#radian%js: Makefile
#	@rm -f $@
#	@cat $(filter %.js,$^) > $@.tmp
#	$(JS_UGLIFY) -b -o $@ $@.tmp
#	@rm $@.tmp
#	@chmod a-w $@

radian.css: src/radian.css
	@cp src/radian.css radian.css

examples: radian.js src/radian.css
	@cp radian.js examples/js
	@cp radian.min.js examples/js
	@cp src/radian.css examples/css

clean:
	rm -f radian*.js

DISTS=examples lib Makefile radian.css radian.js \
      radian.min.js README.md src tools

dist:
	tar czf dist.tar.gz $(addprefix ./,$(DISTS))
	zip -r dist.zip $(addprefix ./,$(DISTS))
