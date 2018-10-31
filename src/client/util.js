const Util =
{
    getRandomCode: () =>
    {
        return Math.floor((1 + Math.random()) * 0x1000000000).toString(16);
    }
};

module.exports = Util;