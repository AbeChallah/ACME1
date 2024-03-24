import { mdiChartTimelineVariant, mdiUpload } from '@mdi/js';
import Head from 'next/head';
import React, { ReactElement, useEffect, useState } from 'react';
import 'react-toastify/dist/ReactToastify.min.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';

import CardBox from '../../components/CardBox';
import LayoutAuthenticated from '../../layouts/Authenticated';
import SectionMain from '../../components/SectionMain';
import SectionTitleLineWithButton from '../../components/SectionTitleLineWithButton';
import { getPageTitle } from '../../config';

import { Field, Form, Formik } from 'formik';
import FormField from '../../components/FormField';
import BaseDivider from '../../components/BaseDivider';
import BaseButtons from '../../components/BaseButtons';
import BaseButton from '../../components/BaseButton';
import FormCheckRadio from '../../components/FormCheckRadio';
import FormCheckRadioGroup from '../../components/FormCheckRadioGroup';
import FormFilePicker from '../../components/FormFilePicker';
import FormImagePicker from '../../components/FormImagePicker';
import { SelectField } from '../../components/SelectField';
import { SelectFieldMany } from '../../components/SelectFieldMany';
import { SwitchField } from '../../components/SwitchField';
import { RichTextField } from '../../components/RichTextField';

import {
  update,
  fetch,
} from '../../stores/purchase_orders/purchase_ordersSlice';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { useRouter } from 'next/router';
import { saveFile } from '../../helpers/fileSaver';
import dataFormatter from '../../helpers/dataFormatter';
import ImageField from '../../components/ImageField';

const EditPurchase_orders = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const initVals = {
    order_date: new Date(),

    status: '',

    products: [],

    supplier: '',
  };
  const [initialValues, setInitialValues] = useState(initVals);

  const { purchase_orders } = useAppSelector((state) => state.purchase_orders);

  const { purchase_ordersId } = router.query;

  useEffect(() => {
    dispatch(fetch({ id: purchase_ordersId }));
  }, [purchase_ordersId]);

  useEffect(() => {
    if (typeof purchase_orders === 'object') {
      setInitialValues(purchase_orders);
    }
  }, [purchase_orders]);

  useEffect(() => {
    if (typeof purchase_orders === 'object') {
      const newInitialVal = { ...initVals };

      Object.keys(initVals).forEach(
        (el) => (newInitialVal[el] = purchase_orders[el] || ''),
      );

      setInitialValues(newInitialVal);
    }
  }, [purchase_orders]);

  const handleSubmit = async (data) => {
    await dispatch(update({ id: purchase_ordersId, data }));
    await router.push('/purchase_orders/purchase_orders-list');
  };

  return (
    <>
      <Head>
        <title>{getPageTitle('Edit purchase_orders')}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton
          icon={mdiChartTimelineVariant}
          title={'Edit purchase_orders'}
          main
        >
          {''}
        </SectionTitleLineWithButton>
        <CardBox>
          <Formik
            enableReinitialize
            initialValues={initialValues}
            onSubmit={(values) => handleSubmit(values)}
          >
            <Form>
              <FormField label='OrderDate'>
                <DatePicker
                  dateFormat='yyyy-MM-dd hh:mm'
                  showTimeSelect
                  selected={
                    initialValues.order_date
                      ? new Date(
                          dayjs(initialValues.order_date).format(
                            'YYYY-MM-DD hh:mm',
                          ),
                        )
                      : null
                  }
                  onChange={(date) =>
                    setInitialValues({ ...initialValues, order_date: date })
                  }
                />
              </FormField>

              <FormField label='Status' labelFor='status'>
                <Field name='Status' id='Status' component='select'>
                  <option value='Pending'>Pending</option>

                  <option value='Shipped'>Shipped</option>

                  <option value='Delivered'>Delivered</option>

                  <option value='Cancelled'>Cancelled</option>
                </Field>
              </FormField>

              <FormField label='Products' labelFor='products'>
                <Field
                  name='products'
                  id='products'
                  component={SelectFieldMany}
                  options={initialValues.products}
                  itemRef={'products'}
                  showField={'name'}
                ></Field>
              </FormField>

              <FormField label='Supplier' labelFor='supplier'>
                <Field
                  name='supplier'
                  id='supplier'
                  component={SelectField}
                  options={initialValues.supplier}
                  itemRef={'suppliers'}
                  showField={'company_name'}
                ></Field>
              </FormField>

              <BaseDivider />
              <BaseButtons>
                <BaseButton type='submit' color='info' label='Submit' />
                <BaseButton type='reset' color='info' outline label='Reset' />
                <BaseButton
                  type='reset'
                  color='danger'
                  outline
                  label='Cancel'
                  onClick={() =>
                    router.push('/purchase_orders/purchase_orders-list')
                  }
                />
              </BaseButtons>
            </Form>
          </Formik>
        </CardBox>
      </SectionMain>
    </>
  );
};

EditPurchase_orders.getLayout = function getLayout(page: ReactElement) {
  return (
    <LayoutAuthenticated permission={'UPDATE_PURCHASE_ORDERS'}>
      {page}
    </LayoutAuthenticated>
  );
};

export default EditPurchase_orders;
