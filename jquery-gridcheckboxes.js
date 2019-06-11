if (typeof Object.create !== 'function') {
    Object.create = function (obj) {
        function f() { };
        f.prototype = obj;
        return new f();
    };
}

; (function ($, window, document, undefined) {

    //Global variables
    var outerdiv = $('<div class="outer"></div>')
    var innerdiv = $('<div class="inner"></div>')

    var mytable = $('<table></table>').attr({ cellspacing: "0", cellpadding: "0", class: "mappingGrid" });
    var settings;
    var self;

    var vGridCheckBoxes = {
        init: function (options, elem) {
            self = this;
            self.elem = elem;
            self.$elem = $(elem);

            if (typeof options === 'string') {
                // string was passed to the query

            } else {
                //Object is passed as override
            }
            settings = $.extend({}, $.fn.Timeline.defaults, options);
        },
        fetchData: function () {
            $.ajax({
                url: settings.url,
                type: 'GET',
                success: function (result) {
                    settings.data = result;
                },
                error: function (result) {
                    alert('Data fetch failed');

                }
            });
        },
        addHeaderRow: function () {
            var self = this;
            var title = settings.title;
            var headerrow = $('<tr></tr>').appendTo(mytable);
            for (var i = 0; i < settings.data.columndata.length + 1; i++)
            {
                if(i == 0)
                {
                    var title = $("<th><label>" + title + " </label></th>")
                    title.appendTo(headerrow);
                    continue;
                }

                var col = $("<td ><label class='headerrow0 headercolumn headercolumn" + (i) + "'> <input class='headercolumnchk'  type='checkbox' />" + settings.data.columndata[i -1] + " </label></td>")
                col.appendTo(headerrow);
            }

            headerrow.appendTo(mytable);
        },
        addRows: function(){
           
            for (var i = 0; i < settings.data.rowdata.length; i++) {
                var row = $('<tr></tr>').appendTo(mytable);
                for (var j = 0; j < settings.data.columndata.length + 1; j++)
                {
                    if (j == 0) {
                        var col = $("<th><label class='headerrow" + (i + 1) + " headercolumn0 headerrow'><input class='headerrowchk' type='checkbox'  />" + settings.data.rowdata[i] + " </label></th>")
                        col.appendTo(row);
                        continue;
                    }
                    var col = $("<td style='text-align:left' ><input type='checkbox' class=' mappings row" + (i + 1) + " column" + j + "' data-rowval='" + settings.data.rowdata[i] + "' data-colval='" + settings.data.columndata[j - 1] + "' /></td>")
                    col.appendTo(row);
                }
            }
        },
        registerClicks: function(){
            $(".headercolumn").on("click", function (e) {


                var clickedindex = $('.headercolumn').index(this);
                var clickedColumn = clickedindex + 1;
                var clickedcolclass = '.column' + clickedColumn

                var clickedValue = $(this).children().eq(0).is(':checked');

                $(this).children().eq(0).prop('checked', !clickedValue);
                $(clickedcolclass).prop('checked', !clickedValue); //prop('checked', true);

                // add all row items to selected
                $(clickedcolclass).each(function (e) {
                    self.setSelection($(this));
                })
                settings.onchange();

                e.stopPropagation();
                e.preventDefault();
            });

            $(".headercolumnchk").on("click", function (e) {


                var clickedindex = $('.headercolumnchk').index(this);
                var clickedColumn = clickedindex + 1;
                var clickedcolclass = '.column' + clickedColumn

                var clickedValue = $(this).is(':checked');

                $(this).prop('checked', clickedValue);
                $(clickedcolclass).prop('checked', clickedValue); //prop('checked', true);

                // add all row items to selected
                $(clickedcolclass).each(function (e) {
                    self.setSelection($(this));
                })
                settings.onchange();

                e.stopPropagation();
                // e.preventDefault();
            });

            $(".headerrow").on("click", function (e) {

                var clickedindex = $('.headerrow').index(this);
                var clickedrow = clickedindex + 1;

                var clickedrowclass = '.row' + clickedrow

                var clickedValue = $(this).children().eq(0).is(':checked');

                $(this).children().prop('checked', !clickedValue);
                $(clickedrowclass).prop('checked', !clickedValue);

                // add all row items to selected
                $(clickedrowclass).each(function (e) {
                    self.setSelection($(this));
                })
                settings.onchange();

                e.preventDefault();
                e.stopPropagation();
            });

            $(".headerrowchk").on("click", function (e) {


                var clickedindex = $('.headerrowchk').index(this);
                var clickedrow = clickedindex + 1;

                var clickedrowclass = '.row' + clickedrow

                var clickedValue = $(this).is(':checked');

                $(this).prop('checked', clickedValue);
                $(clickedrowclass).prop('checked', clickedValue);

                // add all row items to selected
                $(clickedrowclass).each(function (e) {
                    self.setSelection($(this));
                })
                settings.onchange();

                e.stopPropagation();
            });

            $(".mappings").on("click", function (e) {
                self.setSelection($(this));
                settings.onchange();
            });
        },
        loadSelected: function () {
            if (settings.data.selected.length > 0)
            {
                $.each(settings.data.selected, function (key, value) {
                    for (var i = 0; i < settings.data.rowdata.length; i++) {
                        for (var j = 0; j < settings.data.columndata.length + 1; j++) {
                            if (value.rowval == settings.data.rowdata[i] && value.colval == settings.data.columndata[j]) {
                                var selectedclass = '.row' + (i + 1) + '.column' + (j + 1);
                                $(selectedclass).prop('checked', true);
                            }
                        }
                    }
                });
            }
        },
        setSelection: function (elem) {
            var selectedrow = elem.data('rowval');
            var selectedcol = elem.data('colval');

            var clickedValue = elem.is(':checked');
            self.handleSelection(clickedValue, selectedrow, selectedcol)
           
        },
        handleSelection: function (checked, rowval, colval) {
            if (checked == true) {
                if (self.selectionexists(rowval, colval) < 0)
                {
                    settings.data.selected.push({ 'rowval': rowval, 'colval': colval });
                }
                
            }
            else {
                var index = self.selectionexists(rowval, colval);
                if (self.selectionexists(rowval, colval) >= 0) {
                    settings.data.selected.splice(index, 1);
                }
            }
        },
        selectionexists: function (rowval, colval) {
            var arry = settings.data.selected;
            var selectedIndex = -1;
            var i = arry.length;
            while (i--) {
                if (arry[i].rowval == rowval && arry[i].colval == colval) {
                    selectedIndex = i;
                }
            }
            return selectedIndex;
        }
    }

    $.fn.GridCheckBoxes = function (options) {
        return this.each(function () {
            var girdChkbox = Object.create(vGridCheckBoxes);
            girdChkbox.init(options, this);
           // girdChkbox.fetchData();
            girdChkbox.addHeaderRow();
            girdChkbox.addRows();
            mytable.appendTo(innerdiv);
            innerdiv.appendTo(outerdiv);
            outerdiv.appendTo(this);
            girdChkbox.registerClicks();
            girdChkbox.loadSelected();
            $(".inner").hScroll(100);

           
        });
    };

    $.fn.GridCheckBoxes.defaults = {
        title: 'HP Eligibility Code',
        data: {
            columndata: [],
            rowdata: [],
            selected: []
        },
        onchange: function () { },
        url : '',
    };

    $.fn.val = function (array) {
        if (array == null) {
            return settings.data.selected;
        }

        if (array == '') {
            settings.data.selected = []
            return settings.data.selected;
        }

        if (array.length == 0) {
            settings.data.selected = []
            return settings.data.selected;
        }
        if (array.length > 0) {
            settings.data.selected = array
            return settings.data.selected;
            self.loadSelected();
        }

       
        
    };

    return this;

}(jQuery, window, document));