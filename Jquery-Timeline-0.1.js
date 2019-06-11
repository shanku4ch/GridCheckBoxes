if (typeof Object.create !== 'function') {
    Object.create = function(obj) {
        function f() {};
        f.prototype = obj;
        return new f();
    };
}
; (function ($, window, document, undefined) {

    //Global variables
    var mytable = $('<table></table>').attr({ id: "timelineTable", cellspacing: "0", cellpadding: "0", class: "timeline" });
    var settings;

    var vTimeline = {
        init: function(options, elem) {
                var self = this;
                self.elem = elem;
                self.$elem = $(elem);

                if (typeof options === 'string') {
                    // string was passed to the query

                } else {
                    //Object is passed as override
                }
                settings = $.extend({}, $.fn.Timeline.defaults, options);
            },
        addYearRow: function() {
                var self = this;
                var startDate = settings.data.startDate;
                var endDate = settings.data.endDate;

                var yearRow = $('<tr></tr>').appendTo(mytable);
                var startYear = startDate.getFullYear();
                var endYear = endDate.getFullYear();
                var differenceYear = endYear - startYear;
                switch (differenceYear) {
                case 0:
                    this.makeElement($('<td></td>'), { colspan: this.getDaysDifferenceInclusive(startDate, endDate), }, startYear, yearRow);
                    break;
                case 1:
                    this.makeElement($('<td></td>'), { colspan: this.getDaysDifferenceInclusive(startDate, new Date(startYear, 11, 31)), }, startYear, yearRow);
                    this.makeElement($('<td></td>'), { colspan: this.getDaysDifferenceInclusive(new Date(endYear, 0, 1), endDate), }, endYear, yearRow);
                    break;
                default:
                    this.makeElement($('<td></td>'), { colspan: this.getDaysDifferenceInclusive(startDate, new Date(startYear, 11, 31)) }, startYear, yearRow);
                    for (var y = startYear + 1; y < endYear; y++) {
                        if (y % 4 == 0) {
                            this.makeElement($('<td></td>'), { colspan: 366 }, y, yearRow);
                        } else {
                            this.makeElement($('<td></td>'), { colspan: 365 }, y, yearRow);
                        }
                    }
                    this.makeElement($('<td></td>'), { colspan: this.getDaysDifferenceInclusive(new Date(endYear, 0, 1), endDate), }, endYear, yearRow);

                }
            },
        addMonthRow: function() {
                var self = this;
                var startDate = settings.data.startDate;
                var endDate = settings.data.endDate;
                var monthsRow = $('<tr></tr>').appendTo(mytable);

                var startYear = startDate.getFullYear();
                var startMonth = startDate.getMonth();
                var endYear = endDate.getFullYear();
                var endMonth = endDate.getMonth();

                var months = Math.abs(((startYear - endYear) * 12) + startMonth - endMonth);
                var tempMonth = startMonth;
                var tempYear = startYear;

                this.makeElement($('<td></td>'), { colspan: this.getDaysDifferenceInclusive(startDate, this.getEndDateOfMonth(startDate)), }, this.getMonthName(tempMonth), monthsRow);
                if (tempMonth == 11) {
                    tempMonth = 0;
                    tempYear++;
                } else {
                    tempMonth++;
                }
                for (var m = 0; m < months -1 ; m++) {
                    if (tempMonth == 11) {
                        if (m != 0) {
                            this.makeElement($('<td></td>'), { colspan: this.daysInMonth(tempMonth + 1, tempYear), }, this.getMonthName(tempMonth), monthsRow);
                            tempMonth = 0;
                            tempYear++;
                        }
                    } else {
                        this.makeElement($('<td></td>'), { colspan: this.daysInMonth(tempMonth + 1, tempYear), }, this.getMonthName(tempMonth), monthsRow);
                            tempMonth++;
                        }

                }

                this.makeElement($('<td></td>'), { colspan: this.getDaysDifferenceInclusive(this.getStartDateOfMonth(endDate),endDate), }, this.getMonthName(tempMonth), monthsRow);

            },
        addDateRow: function() {
            var self = this;
            var startDate = settings.data.startDate;
            var endDate = settings.data.endDate;
            var dateRow = $('<tr></tr>').appendTo(mytable);

            var cols = this.getDaysDifferenceInclusive(startDate, endDate);
            for (var i = 0; i < cols; i++) {
                this.makeElement($('<td></td>'), { }, this.addDays(startDate, i).toDateString() , dateRow);
            }
        },
        addDaysRow : function() {
            var self = this;
            var startDate = settings.data.startDate;
            var endDate = settings.data.endDate;

            for (var i = 0; i < settings.data.Periods.length; i++) {

                var dayRow = $('<tr></tr>').appendTo(mytable);

                //Print <td> till previous day of start column
                var prevDay = this.addDays(settings.data.Periods[i].StartDate, -1);
                var cols = this.getDaysDifferenceInclusive(startDate, prevDay);

                for (var j = 0; j < cols; j++) {
                    this.makeElement($('<td></td>'), { id: this.getPeriodID(settings.data.Periods[i].ID, this.addDays(startDate, j)) }, settings.Filler, dayRow);
                }

                var dataAttr = this.makeDataAttribute(settings.data.Periods[i]);
                //Print <td> from start of period to end date inclusive
                var periodAttr = {
                    id: this.getPeriodID(settings.data.Periods[i].ID, settings.data.Periods[i].StartDate),
                    colspan: this.getDaysDifferenceInclusive(settings.data.Periods[i].StartDate, settings.data.Periods[i].EndDate),
                    class: 'tooltipitem',
                }
                this.makeElement($('<td ' + dataAttr + '></td>'), periodAttr, settings.data.Periods[i].Description, dayRow);

                // Print <td> from next day of period end to end of calendar
                var nextDay = this.addDays(settings.data.Periods[i].EndDate,1);
                cols = this.getDaysDifferenceInclusive(nextDay, endDate);
                for (j = 0; j < cols; j++) {
                    this.makeElement($('<td></td>'), { id: this.getPeriodID(settings.data.Periods[i].ID, this.addDays(nextDay, j)) }, settings.Filler, dayRow);
                }
            }
        },
        addDays: function (date, days) {
            var retDate = new Date(date);
            retDate.setDate(date.getDate() + days);
            return retDate;
        },
        getDaysDifference: function (startDate, endDate) {
            return Math.floor((endDate - startDate) / 86400000);
        },
        getDaysDifferenceInclusive: function (startDate, endDate) {
            return Math.floor((endDate - startDate) / 86400000) + 1;
        },
        getEndDateOfMonth : function(date) {
            return new Date(date.getFullYear(), date.getMonth(), this.daysInMonth(date.getMonth() + 1, date.getFullYear()));
        },
        daysInMonth: function(month, year) {
            var m = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            if (month != 2) return m[month - 1];
            if (year % 4 != 0) return m[1];
            if (year % 100 == 0 && year % 400 != 0) return m[1];
            return m[1] + 1;
        },
        getMonthName: function(month) {
            var monthFullName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            var monthShortName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            var monthFirstChar = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
            if (settings.MonthNotation === 'FirstChar') {
                return monthFirstChar[month];
            }
            else if (settings.MonthNotation === 'Short') {
                return monthShortName[month];
            }
            else if (settings.MonthNotation === 'Full') {
                return monthFullName[month];
            }
            return monthFullName[month];
        },
        getStartDateOfMonth:function(date) {
            return new Date(date.getFullYear(), date.getMonth(), 1);
        },
        getPeriodID: function (row, date) {
            var yyyy = date.getFullYear().toString();
            var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
            var dd = date.getDate().toString();
            var formattedDate = yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]); // padding
            return 't_ID' + row + '_d' + formattedDate;
        },
        getDataAttributes: function () { },
        makeElement: function(element, attr, text, appendTo) {
            element
                .attr(
                        attr
                     )
                     .text(text)
                     .appendTo(appendTo);
        },
        makeDataAttribute: function (data) {
            var str = "";
            $.each(data, function(key, value) {
                str = str + 'data-' + key + ' = "'+ value+'" ';
            });
            return str;
        },
        addDateHeaders: function (position) {

            if (position === 'Bottom') {

                //add year row if enabled from settings or default
                if (settings.showDateline === true) {
                    this.addDateRow();
                }

                if (settings.showmonthline === true) {
                    this.addMonthRow();
                }


                if (settings.showyearline === true) {
                    this.addYearRow();
                }

            } else {

                //add year row if enabled from settings or default
                if (settings.showyearline === true) {
                    this.addYearRow();
                }

                if (settings.showmonthline === true) {
                    this.addMonthRow();
                }

                if (settings.showDateline === true) {
                    this.addDateRow();
                }
                
            }

        },
        changeTooltipPosition : function(event) {
            var tooltipX = event.pageX + 10 ;
            var tooltipY = event.pageY + 30;
            $('div.tooltip').css({ top: tooltipY, left: tooltipX });
        },
        showTooltip : function(event) {
            $('div.tooltip').remove();

            var row = "";
            $.each($(this).data(), function (k, v) {
            
                row = row + '<tr><td>' + k + ' </td> <td> : </td> <td>' + v + ' </td></tr>';
            });

            var toolTipData = '<table>' + row + '</table>';
            $('<div class="tooltip"><div class="arrow">▲</div>' +
                '<div class="text">' +
                toolTipData
              +'</div></div>')
                .appendTo('body');
        },
        hideTooltip : function() {
            $('div.tooltip').remove();
        },
    }

    $.fn.Timeline = function (options) {
        return this.each(function() {

            var timeline = Object.create(vTimeline);
            timeline.init(options, this);
            
            if (settings.DateHeadersPosition !== 'Bottom') {
                timeline.addDateHeaders(settings.DateHeadersPosition);
            }

            timeline.addDaysRow();

            $(document).on("mousemove", ".tooltipitem", timeline.changeTooltipPosition)
                       .on("mouseenter", ".tooltipitem", timeline.showTooltip)
                       .on("mouseleave", ".tooltipitem", timeline.hideTooltip);




            if (settings.DateHeadersPosition === 'Bottom') {
                timeline.addDateHeaders(settings.DateHeadersPosition);
            }
            mytable.appendTo(this);

        });
    };

    $.fn.Timeline.defaults = {
        showyearline: true,
        showmonthline: true,
        showDateline: true,
        DateLineDateFormat: 'YYYY-MM-DD',
        MonthNotation: 'FirstChar',
        Filler: ' ',
        DateHeadersPosition : 'Top',
        data : {
            startDate: new Date(1970, 1, 1),
            endDate: new Date(),
            Periods: [
                {
                    ID: "1",
                    StartDate: new Date(2014, 1, 14),
                    EndDate: new Date(2015, 0, 21),
                    Description : "NEESP",
                },
                {
                    ID: "2",
                    StartDate: new Date(2015, 10, 14),
                    EndDate: new Date(2016, 1, 21),
                    Description: "shashank",
                },
                {
                    ID: "3",
                    StartDate: new Date(2013, 11, 23),
                    EndDate: new Date(2015, 2, 21),
                    Description: "Chandrika",
                }
            ]

        }
    };

}(jQuery, window, document));
