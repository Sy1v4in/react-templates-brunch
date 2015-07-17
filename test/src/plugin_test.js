var Plugin = require('../../lib/index');
var expect = require('must');
var fs = require('fs');
var path = require('path');
var resources_path = path.resolve(__dirname, '..', 'resources');

console.log = function() {};

describe('Plugin', function () {
    var plugin;

    function read_file(filename) {
        return fs.readFileSync(filename).toString().replace(/\r/g, '').trim();
    }

    beforeEach(function () {
        plugin = new Plugin({});
    });

    it('should be an object', function () {
        expect(plugin).to.exist();
    });

    it('should has #compile method', function () {
        expect(plugin.compile).to.be.an.instanceof(Function);
    });

    it('should compile and produce valid result', function (done) {
        var files = ['inputs.rt', 'repeat.rt', 'done'];
        files.forEach(check);

        function check(file_to_check) {
            if (file_to_check === 'done') {
                done();
            }
            else {
                var filename = path.join(resources_path, file_to_check);
                var content = read_file(filename);
                var expected = read_file(filename + '.js');

                plugin.compile({data: content, path: file_to_check}, function (error, result) {
                    var data = (result || {}).data;
                    expect(error).not.to.exist();
                    expect(data).to.equal(expected);
                });
            }
        }
    });

    it('should report error', function (done) {
        var invalid_files = [
            {file: 'invalid-scope.rt', issue: "RTCodeError: invalid scope part 'a in a in a'"},
            {file: 'invalid-js.rt', issue: 'RTCodeError: Unexpected token ILLEGAL'},
            {file: 'invalid-brace.rt', issue: 'RTCodeError: Unexpected end of input'},
            'done'
        ];

        invalid_files.forEach(check);

        function check(file_to_check) {
            if (file_to_check === 'done') {
                done();
            }
            else {
                var filename = path.join(resources_path, file_to_check.file);
                var content = read_file(filename);

                plugin.compile({data: content, path: file_to_check}, function (error, result) {
                    expect(error).to.equal(file_to_check.issue);
                });
            }
        }
    });

    it('should use configurations', function (done) {
        var configurations_to_be_checked = [
            {config: {defines: {}}, extension: '.common.js'},
            {config: {modules: 'es6'}, extension: '.es6.js'},
            'done'
        ],
            file_to_check = 'div.rt',
            filename = path.join(resources_path, file_to_check),
            content = read_file(filename);

        configurations_to_be_checked.forEach(check);

        function check(config_to_check) {
            if (config_to_check === 'done') {
                done();
            }
            else {
                var expected_content = read_file(filename + config_to_check.extension);

                new Plugin({
                    plugins: {
                        reactTemplates: config_to_check.config
                    }
                }).compile({data: content, path: file_to_check}, function (error, result) {
                        var data = (result || {}).data;
                        expect(error).not.to.exist();
                        expect(data).to.equal(expected_content);
                    });
            }
        }
    });
});
