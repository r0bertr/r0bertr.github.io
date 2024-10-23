var app = new Vue({
    delimiters: ['${', '}'],
    el : '#app',
    data: {
        started: false,
        finish: false,
        index: 0,
        pos: 0,
        result: null,
        sets: new Array(1),
        showAnswer: false,
        mainBtnShow: true,
    },
    methods: {
        onStart: function(index) {
            if (this.sets[index]) {
                this.__init(index);
                return;
            }
            var that = this;
            $.getJSON('index/data/set' + index + '.json', function(data) {
                that.sets[index] = data;
                that.__init(index);
            });
        },
        onOK: function() {
            this.__nextWord(true);
        },
        onPass: function() {
            this.showAnswer = true;
            this.mainBtnShow = false;
            var that = this;
            setTimeout(function() {
                that.showAnswer = false;
                that.mainBtnShow = true;
                that.__nextWord(false);
            }, 3000);
        },
        onExit: function() {
            this.__showResult();
        },
        __init: function(index) {
            this.started = true;
            this.finish = false;
            this.pos = 0;
            this.index = index;
            this.result = new Array(this.sets[index].length);
            for (var i = 0; i < this.result.length; i++) this.result[i] = false;
        },
        __nextWord: function(know) {
            if (this.pos == this.result.length) {
                this.__showResult();
            }
            this.result[this.pos++] = know;
        },
        __showResult: function() {
            this.finish = true;
        },
    },
});
