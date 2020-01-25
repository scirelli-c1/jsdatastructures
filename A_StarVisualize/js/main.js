/*global A_Star*/
(()=> {
    const SVG_NAME_SPACE = 'http://www.w3.org/2000/svg',
        BORDER_THICKNESS = 1,
        BLACK            = 'rgb(0,0,0)',
        WHITE            = 'rgb(255,255,255)',
        GRAY             = 'rgb(128,128,128)',
        YELLOW           = 'rgb(247,255,0)', //'rgb(255,255,0)',
        RED              = 'rgb(255,0,0)',
        GREEN            = 'rgb(0,255,0)',
        MAGENTA          = 'rgb(255,0,255)',
        COLOR_WALL       = BLACK,
        COLOR_HALL       = WHITE,
        COLOR_PATH       = GRAY,
        COLOR_GOAL       = YELLOW,
        COLOR_START      = YELLOW,
        COLOR_BORDER     = BLACK,
        COLOR_BAD_PATH   = MAGENTA,
        COLOR_FOUND      = RED,
        SPEED            = 100,
        FONT_SIZE        = 35,
        BLINK_INTERVAL   = 500,
        REMOVE_FOUND_DELAY = 1500;

    const oReq = new XMLHttpRequest(),

        startBtn = document.querySelector('#start'),
        stopBtn = document.querySelector('#stop'),
        fasterBtn = document.querySelector('#faster'),
        slowerBtn = document.querySelector('#slower'),
        output = document.querySelector('#output'),
        startRoom = document.querySelector('#startRoom'),
        endRoom = document.querySelector('#endRoom'),
        sbAlgorithm = document.querySelector('#algorithm'),

        svg = document.querySelector('svg'),
        svgWidth = svg.getAttributeNS(null, 'width'),
        svgHeight = svg.getAttributeNS(null, 'height');

    let speed = SPEED,
        shader = shadeGenerator(),
        blinkingRooms = [],
        controlRooms = [];

    oReq.addEventListener('load', function reqListener(e) {
        let boardObj = parseStringBoard(this.response.toString());

        const grid = new A_Star.Grid(boardObj.width, boardObj.height)
            .addWalls(boardObj.listOfWalls)
            .addStart(boardObj.start)
            .addGoal(boardObj.end);

        let pathFinder = new A_Star(grid);
        pathFinder.on(A_Star.WALK_COMPLETE, (path)=> {
            console.log(path.join(', '));
        });
        pathFinder.on(A_Star.BUILDER_START_NOT_FOUND, (e)=> {
            console.log('aaaahhh');
        });
        pathFinder.on(A_Star.BUILDER_CUR_CELL, (c)=> {
            console.log(c);
        });

        while(pathFinder.tick());

    });
    oReq.open('GET', 'input.txt');
    oReq.send();


    function drawBoard(gameBoard, svgWidth, svgHeight) {
        var colCount = gameBoard.getWidth()-1,
            rowCount = gameBoard.getHeight(),
            cellWidth = Math.ceil(svgWidth/colCount),
            cellHeight = Math.ceil(svgHeight/rowCount),
            controlRooms = [],
            boardPiece;

        for(let y=0; y<rowCount; y++) {
            for(let x=0, rect; x<colCount; x++) {
                rect = document.createElementNS(SVG_NAME_SPACE, 'rect');
                boardPiece = gameBoard.charAt(x, y);

                if(boardPiece === gameAI.Board.roomTypes.EMPTY_ROOM) {
                    rect.style.fill = COLOR_HALL;
                }else if(boardPiece === gameAI.Board.roomTypes.WALL) {
                    rect.style.fill = COLOR_WALL;
                }else if(!isNaN(boardPiece)) {
                    rect.style.fill = COLOR_GOAL;
                    controlRooms.push(new gameAI.Point(x, y));
                }else{
                    rect.style.fill = COLOR_WALL;
                }

                rect.style.strokeWidth = BORDER_THICKNESS;
                rect.style.stroke = COLOR_BORDER;
                rect.setAttributeNS(null, 'x', x*cellWidth);
                rect.setAttributeNS(null, 'y', y*cellHeight);
                rect.setAttributeNS(null, 'width', cellWidth);
                rect.setAttributeNS(null, 'height', cellHeight);
                svg.appendChild(rect);
            }
        }
    }

    function parseStringBoard(boardStr) {
        const WALL = '#',
            SPACE = '.',
            START = '0',
            GOAL = '7';

        let board = boardStr.split('\n'),
            boardObj = {
                width:       board[0].length,
                height:      board.length,
                listOfWalls: [],
                start:       {x: 0, y: 0},
                end:         {x: 9, y: 9}
            };

        for(let y in board) {
            for(let x in board[y]) {
                let c = board[y][x];
                if(c === WALL) {
                    boardObj.listOfWalls.push({x:x, y:y});
                }else if(c === START) {
                    boardObj.start = {x:x, y:y};
                }else if(c === GOAL) {
                    boardObj.end = {x:x, y:y};
                }
            }
        }

        return boardObj;
    }

    Math.randRange = function(min, max) {
        return Math.floor(Math.random() * ((max - min) + 1) + min);
    };

    function shadeGenerator() {
        var shade = 0;

        return function() {
            var color = shade++ % 136 + 64;
            return 'rgb('+ color + ',' + color + ',' + color + ')';
        };
    }
})();