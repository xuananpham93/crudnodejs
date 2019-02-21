exports.sendData = (res, data, mess, code) => {
    res.send({
        errorCode: code || 0,
        message: mess || '',
        data: data
    });
};

exports.send_error_500 = (res, err) => {
    res.status(500).send({
        errorCode: 500,
        message: err.message,
        data: []
    });
};

exports.calc_test = () => {
    let result = 0;

    for (let index = 0; index < 100; index++) {
        console.log(index);
        result += index;
    }

    return result;
};

