import React from 'react';
import BaseButton from '../BaseButton';
import BaseIcon from '../BaseIcon';
import * as icons from '@mdi/js';
import dynamic from 'next/dynamic';
import { humanize } from '../../helpers/humanize';
import { useAppDispatch } from '../../stores/hooks';

import { fetchWidgets, removeWidget } from '../../stores/roles/rolesSlice';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
type ValueType = { [key: string]: string | number }[];

const dataForBarChart = (value: any[]) => {
  if (!value?.length) return [{ name: '', data: [] }];
  const valueKey = Object.keys(value[0])[1];
  const data = value.map((el) => +el[valueKey]).reverse();

  return [{ name: humanize(valueKey), data }];
};
const dataForPieChart = (value: any[]) => {
  if (!value?.length) return [{ name: '', data: [] }];

  if (
    !isNaN(parseFloat(value[0][Object.keys(value[0])[1]])) &&
    isFinite(value[0][Object.keys(value[0])[1]])
  ) {
    return value.map((el) => +el[Object.keys(value[0])[1]]).reverse();
  }
  const valueKey = Object.keys(value[0])[0];
  return value.map((el) => +el[valueKey]).reverse();
};

const optionsForBarChart = (
  value: ValueType,
  chartColor: string[],
  currency: boolean,
) => {
  const chartColors = Array.isArray(chartColor)
    ? chartColor
    : [chartColor || '#3751FF'];
  const defaultOptions = {
    xaxis: {},
    chart: {
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        distributed: false,
      },
    },
    colors: [],
  };

  if (!value?.length) return defaultOptions;

  const key = Object.keys(value[0])[0];
  const categories = value
    .map((el) => el[key])
    .reverse()
    .map((item) =>
      typeof item === 'string' && item?.length > 7
        ? item?.slice(0, 7)
        : item || '',
    );

  if (categories.length <= 3) {
    defaultOptions.plotOptions = {
      bar: {
        distributed: true,
      },
    };
  }

  const colors = [];
  for (let i = 0; i < categories.length; i++) {
    colors.push(chartColors[i % chartColors.length]);
  }

  return {
    ...defaultOptions,
    yaxis: {
      labels: {
        formatter: function (value) {
          if (currency) {
            return '$' + value;
          } else {
            return value;
          }
        },
      },
    },
    dataLabels: {
      formatter: (val) => {
        if (currency) {
          return '$' + val;
        } else {
          return val;
        }
      },
    },
    legend: {
      show: false,
    },
    xaxis: {
      categories,
    },
    colors,
  };
};
const optionsForPieChart = (value: ValueType, chartColor: string) => {
  const chartColors = Array.isArray(chartColor)
    ? chartColor
    : [chartColor || '#3751FF'];
  const defaultOptions = {
    xaxis: {},
    chart: {
      toolbar: {
        show: false,
      },
    },
    colors: [],
  };

  if (!value?.length) return defaultOptions;
  if (
    !isNaN(Number(value[0][Object.keys(value[0])[1]])) &&
    isFinite(Number(value[0][Object.keys(value[0])[1]]))
  ) {
    const labels = value.map((el) => el[Object.keys(value[0])[0]]).reverse();
    // if colors length is less than labels length, then add colors to the colors array until it is equal to labels length
    const colors = [];
    for (let i = 0; i < labels.length; i++) {
      colors.push(chartColors[i % chartColors.length]);
    }

    return {
      ...defaultOptions,
      colors,
      labels,
    };
  }
  const key = Object.keys(value[0])[1];
  const categories = value.map((el) => el[key]).reverse();

  return {
    ...defaultOptions,
    labels: categories,
  };
};

export const SmartWidget = ({ widget, userId, admin, roleId }) => {
  const dispatch = useAppDispatch();

  const deleteWidget = async () => {
    await dispatch(
      removeWidget({ id: userId, widgetId: widget.widget_id, roleId }),
    );
    await dispatch(fetchWidgets(roleId));
  };

  return (
    <div
      className={`rounded dark:bg-dark-900 bg-white border border-pavitra-400 dark:border-dark-700 p-6 ${
        widget.widget_type === 'chart'
          ? 'col-span-2'
          : 'lg:col-span-1 col-span-2'
      }`}
    >
      <div className='flex justify-between flex-col h-full'>
        <div className='flex justify-between items-center'>
          <div className='text-lg leading-tight text-gray-500 dark:text-dark-600 line-clamp-2'>
            {widget.label}
          </div>

          {admin && (
            <BaseButton
              icon={icons.mdiClose}
              color='whiteDark'
              roundedFull
              onClick={deleteWidget}
            />
          )}
        </div>
        <div className='flex justify-between items-center h-full'>
          <div
            className={`${
              widget.widget_type === 'chart' ? 'w-5/6 justify-center' : ''
            } items-center flex flex-grow`}
          >
            {widget.widget_type === 'chart' ? (
              widget.value ? (
                <Chart
                  options={
                    widget.chart_type === 'bar' || widget.chart_type === 'line'
                      ? optionsForBarChart(
                          widget.value,
                          widget.color_array,
                          widget.currency,
                        )
                      : optionsForPieChart(widget.value, widget.color_array)
                  }
                  series={
                    widget.chart_type === 'bar' || widget.chart_type === 'line'
                      ? dataForBarChart(widget.value)
                      : dataForPieChart(widget.value)
                  }
                  type={widget.chart_type}
                  height={200}
                  style={{ width: '100%' }}
                />
              ) : (
                <div>
                  Something went wrong, please try again or use a different
                  query.
                </div>
              )
            ) : (
              widget.widget_type === 'scalar' &&
              (widget.value ? (
                <div className='text-3xl leading-tight font-semibold truncate'>
                  {widget.value}
                </div>
              ) : (
                <div className='text-center text-red-400'>
                  Something went wrong, please try again or use a different
                  query.
                </div>
              ))
            )}
          </div>
          {widget.widget_type === 'scalar' && widget.mdi_icon && (
            <div className='flex justify-end w-1/4'>
              <BaseIcon
                className='text-blue-500 flex-shrink-0'
                w='w-16'
                h='h-16'
                size={48}
                fill={widget.color}
                path={icons[widget.mdi_icon]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
