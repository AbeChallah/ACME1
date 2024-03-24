import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import 'react-toastify/dist/ReactToastify.min.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { useRouter } from 'next/router';
import { fetch } from '../../stores/purchase_orders/purchase_ordersSlice';
import { saveFile } from '../../helpers/fileSaver';
import dataFormatter from '../../helpers/dataFormatter';
import ImageField from '../../components/ImageField';
import LayoutAuthenticated from '../../layouts/Authenticated';
import { getPageTitle } from '../../config';
import SectionTitleLineWithButton from '../../components/SectionTitleLineWithButton';
import SectionMain from '../../components/SectionMain';
import CardBox from '../../components/CardBox';
import BaseButton from '../../components/BaseButton';
import BaseDivider from '../../components/BaseDivider';
import { mdiChartTimelineVariant } from '@mdi/js';
import { SwitchField } from '../../components/SwitchField';
import FormField from '../../components/FormField';

const Purchase_ordersView = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { purchase_orders } = useAppSelector((state) => state.purchase_orders);

  const { id } = router.query;

  function removeLastCharacter(str) {
    console.log(str, `str`);
    return str.slice(0, -1);
  }

  useEffect(() => {
    dispatch(fetch({ id }));
  }, [dispatch, id]);

  return (
    <>
      <Head>
        <title>{getPageTitle('View purchase_orders')}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton
          icon={mdiChartTimelineVariant}
          title={removeLastCharacter('View purchase_orders')}
          main
        >
          {''}
        </SectionTitleLineWithButton>
        <CardBox>
          <FormField label='OrderDate'>
            {purchase_orders.order_date ? (
              <DatePicker
                dateFormat='yyyy-MM-dd hh:mm'
                showTimeSelect
                selected={
                  purchase_orders.order_date
                    ? new Date(
                        dayjs(purchase_orders.order_date).format(
                          'YYYY-MM-DD hh:mm',
                        ),
                      )
                    : null
                }
                disabled
              />
            ) : (
              <p>No OrderDate</p>
            )}
          </FormField>

          <div className={'mb-4'}>
            <p className={'block font-bold mb-2'}>Status</p>
            <p>{purchase_orders?.status ?? 'No data'}</p>
          </div>

          <>
            <p className={'block font-bold mb-2'}>Products</p>
            <CardBox
              className='mb-6 border border-gray-300 rounded overflow-hidden'
              hasTable
            >
              <div className='overflow-x-auto'>
                <table>
                  <thead>
                    <tr>
                      <th>ProductName</th>

                      <th>Price</th>

                      <th>StockLevel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchase_orders.products &&
                      Array.isArray(purchase_orders.products) &&
                      purchase_orders.products.map((item: any) => (
                        <tr
                          key={item.id}
                          onClick={() =>
                            router.push(
                              `/products/products-view/?id=${item.id}`,
                            )
                          }
                        >
                          <td data-label='name'>{item.name}</td>

                          <td data-label='price'>{item.price}</td>

                          <td data-label='stock_level'>{item.stock_level}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {!purchase_orders?.products?.length && (
                <div className={'text-center py-4'}>No data</div>
              )}
            </CardBox>
          </>

          <div className={'mb-4'}>
            <p className={'block font-bold mb-2'}>Supplier</p>

            <p>{purchase_orders?.supplier?.company_name ?? 'No data'}</p>
          </div>

          <BaseDivider />

          <BaseButton
            color='info'
            label='Back'
            onClick={() => router.push('/purchase_orders/purchase_orders-list')}
          />
        </CardBox>
      </SectionMain>
    </>
  );
};

Purchase_ordersView.getLayout = function getLayout(page: ReactElement) {
  return (
    <LayoutAuthenticated permission={'READ_PURCHASE_ORDERS'}>
      {page}
    </LayoutAuthenticated>
  );
};

export default Purchase_ordersView;
