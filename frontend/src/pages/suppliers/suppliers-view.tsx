import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import 'react-toastify/dist/ReactToastify.min.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { useRouter } from 'next/router';
import { fetch } from '../../stores/suppliers/suppliersSlice';
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

const SuppliersView = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { suppliers } = useAppSelector((state) => state.suppliers);

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
        <title>{getPageTitle('View suppliers')}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton
          icon={mdiChartTimelineVariant}
          title={removeLastCharacter('View suppliers')}
          main
        >
          {''}
        </SectionTitleLineWithButton>
        <CardBox>
          <div className={'mb-4'}>
            <p className={'block font-bold mb-2'}>CompanyName</p>
            <p>{suppliers?.company_name}</p>
          </div>

          <div className={'mb-4'}>
            <p className={'block font-bold mb-2'}>ContactName</p>
            <p>{suppliers?.contact_name}</p>
          </div>

          <div className={'mb-4'}>
            <p className={'block font-bold mb-2'}>ContactEmail</p>
            <p>{suppliers?.contact_email}</p>
          </div>

          <div className={'mb-4'}>
            <p className={'block font-bold mb-2'}>Phone</p>
            <p>{suppliers?.phone}</p>
          </div>

          <FormField label='Multi Text' hasTextareaHeight>
            <textarea
              className={'w-full'}
              disabled
              value={suppliers?.address}
            />
          </FormField>

          <>
            <p className={'block font-bold mb-2'}>Purchase_orders Supplier</p>
            <CardBox
              className='mb-6 border border-gray-300 rounded overflow-hidden'
              hasTable
            >
              <div className='overflow-x-auto'>
                <table>
                  <thead>
                    <tr>
                      <th>OrderDate</th>

                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.purchase_orders_supplier &&
                      Array.isArray(suppliers.purchase_orders_supplier) &&
                      suppliers.purchase_orders_supplier.map((item: any) => (
                        <tr
                          key={item.id}
                          onClick={() =>
                            router.push(
                              `/purchase_orders/purchase_orders-view/?id=${item.id}`,
                            )
                          }
                        >
                          <td data-label='order_date'>
                            {dataFormatter.dateTimeFormatter(item.order_date)}
                          </td>

                          <td data-label='status'>{item.status}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {!suppliers?.purchase_orders_supplier?.length && (
                <div className={'text-center py-4'}>No data</div>
              )}
            </CardBox>
          </>

          <BaseDivider />

          <BaseButton
            color='info'
            label='Back'
            onClick={() => router.push('/suppliers/suppliers-list')}
          />
        </CardBox>
      </SectionMain>
    </>
  );
};

SuppliersView.getLayout = function getLayout(page: ReactElement) {
  return (
    <LayoutAuthenticated permission={'READ_SUPPLIERS'}>
      {page}
    </LayoutAuthenticated>
  );
};

export default SuppliersView;
