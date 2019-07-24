import _ from "lodash";

export const init = (x = 4, y = 4) => _.fill(Array(x * y), 0);
const locateValues = (condition, grid) =>
  _.reduce(
    grid,
    (result, value, key) => {
      condition(value) && result.push(key);
      return result;
    },
    []
  );

const locateValuesCurried = _.curry(locateValues);
const locateEmptyValues = locateValuesCurried(value => value === 0);
const locateOccupiedValues = locateValuesCurried(value => value !== 0);

export function addRandomNumber(grid) {
  const emptyValuesIndices = locateEmptyValues(grid);
  if (!emptyValuesIndices.length) {
    return grid;
  }

  const randomEmptyPositionIndex = _.random(0, emptyValuesIndices.length - 1);
  const randomEmptyPosition = emptyValuesIndices[randomEmptyPositionIndex];
  const isFour = 0.8;
  grid[randomEmptyPosition] = _.random(1, true) >= isFour ? 4 : 2;
  return grid;
}

const getDimensions = size => _.floor(Math.sqrt(size));
// Asssuming grid is square
function rowColFromPosition(size, position) {
  const dimensions = getDimensions(size);
  return { x: position % dimensions, y: Math.floor(position / dimensions) };
}

function positionFromRowCol(size, col, row) {
  return size * row + col;
}

function seekOffset(direction) {
  switch (direction) {
    case "up":
      return { seekOffsetRow: 0, seekOffsetCol: -1 };
    case "down":
      return { seekOffsetRow: 0, seekOffsetCol: 1 };
    case "left":
      return { seekOffsetRow: -1, seekOffsetCol: 0 };
    case "right":
      return { seekOffsetRow: 1, seekOffsetCol: 0 };
    default:
      break;
  }
  return null;
}

function seek(seekOffsetRow, seekOffsetCol, grid, startPosition) {
  const dimensions = getDimensions(grid.length);

  const bothInBound = (_dimensions, _currRow, _currCol) =>
    _.lt(_currRow, _dimensions) &&
    _.gte(_currRow, 0) &&
    _.lt(_currCol, _dimensions) &&
    _.gte(_currCol, 0);

  let rowCol = rowColFromPosition(grid.length, startPosition);
  let currRow = rowCol.x;
  let currCol = rowCol.y;

  let currPosition = startPosition;

  while (
    bothInBound(dimensions, currRow + seekOffsetRow, currCol + seekOffsetCol)
  ) {
    currRow += seekOffsetRow;
    currCol += seekOffsetCol;

    currPosition = positionFromRowCol(dimensions, currRow, currCol);
    if (grid[currPosition] !== 0) {
      return currPosition;
    }
  }

  return currPosition;
}

export function translateNumbers(direction, grid) {
  const { seekOffsetRow, seekOffsetCol } = seekOffset(direction);
  const dimensions = getDimensions(grid.length);
  const oneOffset = positionFromRowCol(
    dimensions,
    seekOffsetRow,
    seekOffsetCol
  );

  let newGrid = _.clone(grid);

  let i = 0;
  let loopCondition = value => _.lt(value, grid.length);
  let update = i => i + 1;
  if (direction === "down" || direction === "right") {
    i = grid.length - 1;
    loopCondition = value => _.gte(value, 0);
    update = i => i - 1;
  }

  const mergedPositions = new Set();
  // should probably check somewhere that all the numbers in the row/col are unique to not move the row
  for (let k = 0; k < 4; ++k) {
    for (; loopCondition(i); i = update(i)) {
      const foundPosition = seek(seekOffsetRow, seekOffsetCol, newGrid, i);

      if (newGrid[i] === 0 || foundPosition === i) {
        continue;
      }

      if (newGrid[foundPosition] === 0) {
        newGrid[foundPosition] = newGrid[i];
        newGrid[i] = 0;
      } else if (
        newGrid[foundPosition] === newGrid[i] &&
        !mergedPositions.has(foundPosition)
      ) {
        // merge
        newGrid[foundPosition] += newGrid[i];
        newGrid[i] = 0;
        mergedPositions.add(foundPosition);
      } else if (
        newGrid[foundPosition] !== newGrid[i] ||
        mergedPositions.has(foundPosition)
      ) {
        //put it one ahead of it
        newGrid[foundPosition - oneOffset] = newGrid[i];
        if (i !== foundPosition - oneOffset) {
          newGrid[i] = 0;
        }
      }
    }
  }

  return newGrid;
}

export const prettyOutput = _board =>
  _(_board)
    .chunk(4)
    .map(row => JSON.stringify(row))
    .value();
