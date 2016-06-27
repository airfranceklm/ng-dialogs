export default (new Generator()).uniqueId;

function Generator() {
    var i = 0;

    function uniqueId(prefix) {
        return (prefix || '') + (++i);
    }

    return {
        uniqueId: uniqueId
    };
}
