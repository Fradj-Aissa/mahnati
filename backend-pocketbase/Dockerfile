FROM alpine:latest
RUN apk add --no-cache unzip ca-certificates

# تحميل النسخة الرسمية المتوافقة من موقع PocketBase
ARG PB_VERSION=0.40.2
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/ && rm /tmp/pb.zip

# نسخ مجلد الترحيلات وملف المخطط تلقائياً داخل الحاوية لضمان تطبيق الهيكلة والتغييرات عند الإقلاع على Render
COPY ./pb_migrations /pb/pb_migrations
COPY ./pb_schema.json /pb/pb_schema.json

EXPOSE 8080

# تشغيل السيرفر مع الترحيل التلقائي
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080", "--dir=/pb/pb_data", "--migrationsDir=/pb/pb_migrations"]