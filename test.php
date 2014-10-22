<?php
/**
 * Calculate the elapsed time between two timestamps
 * and display in a pretty human way.
 * @param  integer $start Initial timestamp
 * @param  integer $end   Final timestamp, set to -1 for current time.
 * @return string         Formatted elapsed time.
 */
function timeBetween($start, $end=-1){
  	if($end < 0) $end = time();

  	// Adjust this definition if you want
	// this assumes all months have 30 days, every year
	// 365 days, and every month 4 weeks. Since it is only
	// to give a very rough estimate of the time elapsed it should
	// be fine though.
	$SECOND = 1;
	$MINUTE = 60 * $SECOND;
	$HOUR = 60 * $MINUTE;
	$DAY = 24 * $HOUR;
	$WEEK = 7 * $DAY;
	$MONTH = 30 * $DAY;
	$YEAR = 365 * $DAY;

	$increments = [
		[$SECOND, 'second'],
		[$MINUTE, 'minute'],
		[$HOUR, 'hour'],
		[$DAY, 'day'],
		[$WEEK, 'week'],
		[$MONTH, 'month'],
		[$YEAR, 'year']
	];

	$diff = $end - $start;
	$plural = '';
	$units = ceil($diff/$increments[count($increments)-1][0]);
	$unit = $increments[count($increments)-1][1];

	for($i = 1; $i < count($increments); $i++){

		if($increments[$i-1][0] <= $diff && $diff < $increments[$i][0]){
			$units = ceil($diff/$increments[$i-1][0]);
			$unit = $increments[$i-1][1];
			break;
		}
	}

	
	if($units > 1) $plural = 's';
	return sprintf("%d %s%s", $units, $unit, $plural);
}

echo timeBetween(time()-3600).' ago';